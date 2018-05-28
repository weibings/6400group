const express = require("express");
const bodyParser = require('body-parser');
//const connection = require("./database/mysql.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

let app = express();

const port = process.env.PORT|| 3000; 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname+'/public'));

app.get("/", function(req, res) {
	res.render("home.ejs");
})

app.get("/main", function(req, res){
	res.render("main");
})

app.get("/login", function(req, res){
	res.render("login.ejs");
});

app.post("/login", function(req, res){
	res.render("main");
})

app.get("/resource", function(req, res){
	res.render("resource");
})

app.post("/resource", function(req, res){
	res.render("main");
})

app.get("/emergence", function(req, res){
	res.render("incident");
})
app.post("/emergence", function(req, res){
	res.redirect("/main");
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

app.get("/report", function(req, res){
	res.render("report");
})

app.listen(port, function(){
	console.log("connected");
})