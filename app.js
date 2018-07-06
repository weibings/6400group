const express = require("express");
const bodyParser = require('body-parser');
const connection = require("./database/mysql.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require('express-session');
const methodOverride = require("method-override");
const {generateAuthToken, findByCredential, authenticate, findAdditionalInfo} = require("./middleware/authenticate.js");
require('./config/config.js');

let app = express();
const port = process.env.PORT|| 3000; 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(flash());
app.use(express.static(__dirname+'/public'));
app.use(session({
    cookie: { maxAge: 60000 },
    // store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(methodOverride("_method"));

app.use(function(req, res, next){
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	let token = req.cookies.auth;
	if(!token) {
		res.locals.currentUser = '';
		return next();
	}
	try{
     	let decoded = jwt.verify(token, process.env.JWT_SECRET);
	  	res.locals.currentUser = decoded.username;
	  	res.locals.curretType = decoded.currentType;
	}catch(e){
	  	return console.log(e);
	}
	next();
});

app.get("/", function(req, res) {
	res.render("home.ejs");
})

app.get("/main", findAdditionalInfo, function(req, res){
	res.render("main", {name: res.locals.name, additional: res.locals.additional});
})

//log in
app.get("/login", function(req, res){
	if(!req.cookies.auth){
		res.render("login");
	}else{
		req.flash("success", "You've already logged in!")
		res.redirect("back");
	}
});

app.post("/login", function(req, res){
	let username = req.body.username;
	let password = req.body.password;
	console.log(username);
	findByCredential(username, password, function(result){
		console.log(result);
		if (result && result.length > 0) {
			let token = generateAuthToken(result[0].username);
			if (token){
				res.header('x-auth', token);
				res.cookie('auth', token, { maxAge: 6000000, httpOnly: true });
				req.flash("success", "Welcome to EMRS "+username+"!");
				
				res.redirect("/main");
				
			}else{
				req.flash("error", "Incorrect login or disabled account.")
				res.redirect("/login");;
			} 		
		}else{
			req.flash("error", "Incorrect login or disabled account.")
			res.redirect("/login");
		
		}
	});	
	});
	
//log out
app.get("/logout", authenticate, function(req, res){
	console.log('log out');
	res.cookie('auth', "", {expires: new Date(0)});
	//console.log("Successfully logged out!")
	req.flash("success", "You've successfully logged out!")
	res.redirect("/");
})


function getESF(callback){
	let esfs =[];
	connection.query("select * from ESF", function(err, result){
		if(err){
			callback(err, null);
		}else{
			for(let i = 0; i < result.length; i++){
				esfs.push(result[i].ESFID+'-'+result[i].description);
				
			}
			callback(null, esfs);
		}
	});
};

function getUnits(callback){
	let units =[];
	connection.query("select * from CostUnit", function(err, result){
		if(err){
			callback(err, null);
		}else{
			for(let i = 0; i < result.length; i++){
				units.push(result[i].unit);
			}
			callback(null, units);
		}
	});
};
//get add resource page
app.get("/resource", authenticate, function(req, res){
	let esfs = [];
	let units = [];
	
	getESF(function(err, data){
		esfs = data;

		getUnits(function(err2, data2){
			units = data2;
			res.render("resource", {esfs: esfs, units:units});
		});
		
	});
	console.log(units);
	// res.render("resource", {esfs: esfs, units:units});
});

//add resoure to database
app.post("/resource", function(req, res){
	console.log(req.body);
	let owner = req.body.owner
	let resourceName = req.body.resourceName;
	let primaryESF = req.body.primaryESF;
	let additionalESF = req.body.additionalESF;
	let model = req.body.model;
	let capabilities = req.body.capabilities;
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	let distance = req.body.distance;
	let money = req.body.money;
	let unit = req.body.unit;
	let sql = "INSERT INTO Resource (owner, resource_name, model, latitude, longitude, cost, maximum_distance) VALUES(?,?,?,?,?,?,?)";
	connection.query(sql, [owner, resourceName, model, latitude, longitude, money, distance], function(err, result){
		if(err){
			return console.log(err);
		}
		let resourceID = result.insertId;

		let resources = [];
		resources.push([resourceID, primaryESF.split(' ')[0], 'primary']);
		if(additionalESF && additionalESF.length > 0){
			for(let i = 0; i < additionalESF.length; i++){
				resources.push([resourceID, additionalESF[i].split(' ')[0], 'additional'])
			}
		}
		
		sql = "INSERT INTO ResourceESF (resourceID, ESFID, type) VALUES ?";
		connection.query(sql, [resources], function(err2, result2){
			if(err2){
				return console.log(err2);
			}
		});
		sql = "INSERT INTO ResourceCostUnit (resourceID, unit) VALUES (?, ?)";
		connection.query(sql, [resourceID, unit], function(err3, result3){
			if(err3){
				return console.log(err3);
			}
		})
		if(capabilities && capabilities.length > 0){
			let cap = capabilities.split("\n");
			let res_cap = [];
			for(let i = 0; i < cap.length-1; i++){
				res_cap.push([resourceID, cap[i]]);
			}
			sql = "INSERT INTO Capabilities (resourceID, capability) VALUES ?";
			connection.query(sql, [res_cap], function(err3, result3){
				if(err3){
					return console.log(err3);
				};
			});
		}
		

	});
	req.flash("success", "You just added a new resource!");
	res.redirect("/main");
})

//get add incident page
app.get("/emergence", function(req, res){
	let sql = "select * from Declaration";
	let declarations = [];
	connection.query(sql, function(err, result){
		if(err){
			return console.log(err);
		}
		for(let i = 0; i < result.length; i++){
			declarations.push(result[i].Type);
		}
		console.log(declarations);
		res.render("incident", {declarations:declarations});
	})
	
})
//add incidents to incident table
app.post("/emergence", function(req, res){
	console.log(req.body);
	let declaration = req.body.declaration;
	let date = req.body.date;
	// console.log(date);
	let description = req.body.description;
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	let index = 0;
	let abbreviation;
	connection.query("select abbreviation from Declaration where Type = ?", declaration, function(err, result){
		if(err){
			return console.log(err);
		}
		console.log(result);
		abbreviation = result[0].abbreviation;
		connection.query("select count(*)+1 as count from Incident where abbreviation = ?", abbreviation, function(err2, result2){
			if(err2){
				return console.log(err);
			}
			console.log(result2)
			index = result2[0].count;
			console.log(index);
			let sql = "INSERT INTO Incident (count_number, owner, date, abbreviation, description, latitude, longitude) VALUES (?,?,?,?,?,?,?)";
			connection.query(sql,[index, res.locals.currentUser, date, abbreviation, description, latitude, longitude], function(err3, result3){
				if(err3){
					return console.log(err3);
				}
			});
			req.flash("success", "You just added a new resource!");
			res.redirect("/main");
		})
	})

	
})
app.get("/resources", function(req, res){
	res.render("resources");
})
app.post("/resources", function(req, res){
	res.render("results");
})
app.get("/status", function(req, res){
	res.render("status");
})

//get resource report page
app.get("/report", function(req, res){
	// let sql ="select ESF.ESFID, count(*) as count, R.type from ESF left join (select * from ResourceESF where ResourceESF.type = ?) As R on ESF.ESFID = R.ESFID group by ESF.ESFID order by ESF.ESFID";
	// connection.query(sql, 'primary', function(err, result){
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	let total_res = [];
	// 	let total = 0;
	// 	if(result && result.length > 0){
	// 		for(let i = 0; i < result.length; i++){
	// 			if(!result[i].type){
	// 				total_res.push(0);
	// 			}else{
	// 				total_res.push(result[i].count);
	// 				total += result[i].count;
	// 			}
	// 		}
	// 	}
	let results = [];
	let total_res = 0;
	let res_in_use = 0;
		let sql = "select T.ESFID, T.description, count(*) as total, count(case when Resource.availability=? then 1 else null end) as 'in use', T.type from (select ESF.ESFID, ESF.description, R.resourceID, R.type from ESF left join (select * from ResourceESF where ResourceESF.type = ?) As R on ESF.ESFID = R.ESFID) as T left join Resource on Resource.resourceID = T.resourceID group by T.ESFID order by T.ESFID";
		connection.query(sql, ['in use', 'primary'], function(err, result){
			if(err){
				return console.log(err);
			}
			if(result && result.length > 0){
				for(let i = 0; i < result.length; i++){
					let total = result[i].total;
					if(result[i].type !== 'primary'){
						total = 0;
					}
					results.push([result[i].ESFID, result[i].description, total, result[i]['in use']]);
					total_res += total;
					res_in_use += result[i]['in use'];
				}
			}
			console.log(results);
			console.log(total_res);
			res.render("report",{results:results, total_res:total_res, res_in_use:res_in_use});
		});
		
	})
	
// })

app.listen(port, function(){
	console.log("connected");
})