const express = require('express');
//const bodyParser = require('body-parser');
const connection = require("./../database/mysql.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

function generateAuthToken(username) {
  let access = 'auth';
  let token = jwt.sign({username, access}, process.env.JWT_SECRET).toString();
   return token;
	
};

function findByCredential(username, password, callback){
	connection.query("select * from User where username = ?",[username], function(err, result) {
		if (err) {
			console.log(err);
		}else{
			callback(result);
			}
	    });
}

function authenticate(req, res, next) {
  let token = req.cookies.auth;
  if(!token){
    req.flash("error", "You need to be logged in to do that");
    return res.redirect("/login");
  }
  let decoded;
  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
  }catch(e){
    return console.log(e);
  }
  connection.query("select * from User where name=?", [decoded.username], function(err, result){
    if(err) {
      return console.log(err);
    }
    console.log(result);
    if(result){
      if(result.length === 0){
        req.flash("error", "Please log in first");
        return res.redirect("/login");
      }else{
        req.token = token;
        next();
      }
    }else{
      res.status(401).send();
    }
    
  })
};

function findAdditionalInfo(req, res, next) {
  let token = req.cookies.auth;

  if(!token){
  	req.flash("error", "You need to be logged in to do that");

  	return res.redirect("/login");
  }
  let decoded;
  try{
  	decoded = jwt.verify(token, process.env.JWT_SECRET);

  	// console.log(decoded);
  }catch(e){
  	return console.log(e);
  }
  connection.query("select * from User where username=?", [decoded.username], function(err, result){
  	if(err) {
  		return console.log(err);
  	}
  	
  	if(result){
  		if(result.length === 0){
  			req.flash("error", "Please log in first");
  			return res.redirect("/login");
  		}else{
        req.token = token;
        switch(result[0].type){
         case 'company':
           connection.query("select * from Company where username=?",[result[0].username], function(err, result2){
             if(err){
               return console.log(err);
             }
             res.locals.name = result[0].name;
             res.locals.additional = result2[0].headquarter+", "+result2[0].num_of_employees+" employess";
             next();
           });
           break;
         case 'government':
           connection.query("select * from Government where username=?",[result[0].username], function(err, result2){
               if(err){
                 return console.log(err);
               }
               res.locals.name = result[0]['name'];
               res.locals.additional = result2[0]['agency_name']+"at "+result2[0['local_office']];
               next();
             });
             break;
         case 'municipality':
           connection.query("select * from Municipality where username=?",[result[0].username], function(err, result2){
               if(err){
                 return console.log(err);
               }
               res.locals.name = result[0].name;
               res.locals.additional = result2[0]['category'];
                next();
               // res.redirect("/main", {name: result[0].name, additional_info: result[0].category});
             });
             break;
         default:
           res.locals.name = result[0].name;
           res.locals.additional = null;
           next();
           // res.render("main", {name: result[0].name, additional_info: null});
           break;
        }
  		}
  	}else{
  		res.status(401).send();
  	}
  	
  })
};


module.exports = {generateAuthToken, findByCredential, authenticate, findAdditionalInfo};