const mysql = require('mysql');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('../config/config.js');

// console.log(process.env.user);
// console.log(process.env.password);
// console.log(process.env.host);



let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'mw141023',
	database:'cs6400team063'
});

connection.connect((err) =>{
	if(err) {
		console.log(err);
		return;
	}
	console.log('connected as id '+ connection.threadId);

	connection.query('CREATE DATABASE IF NOT EXISTS cs6400team063', function (err) {
	    if (err) {
	    	console.log(err);
	    }
	    let createTable = 'CREATE TABLE if NOT EXISTS User (username varchar(50) NOT NULL, name varchar(50) NOT NULL, password varchar(500) NOT NULL, type varchar(50) NOT NULL, PRIMARY KEY (username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table User has been created");
	    		}
	    	});

	    createTable = 'CREATE TABLE if not exists Individual (username varchar(50) NOT NULL, job_title varchar(50) NOT NULL, date_hired datetime NOT NULL, PRIMARY KEY (username), CONSTRAINT fk_Individual_username_User_username FOREIGN KEY (username) REFERENCES User (username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Individual has been created");
	    		}
	    	});

	    createTable = 'CREATE TABLE if not exists Municipality (username varchar(50) NOT NULL,category varchar(50) NOT NULL, PRIMARY KEY (username), CONSTRAINT fk_Municipality_username_User_username FOREIGN KEY (username) REFERENCES User(username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Municipality has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE if not exists Government (username varchar(50) NOT NULL, agency_name varchar(50) NOT NULL, local_office varchar(50) NOT NULL, PRIMARY KEY (username), CONSTRAINT fk_Government_username_User_username FOREIGN KEY (username) REFERENCES `User`(username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Government has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE if not exists Company (username varchar(50) NOT NULL, headquarter varchar(50) NOT NULL, num_of_employees int(16) NOT NULL, PRIMARY KEY (username), CONSTRAINT fk_Company_username_User_username FOREIGN KEY (username) REFERENCES `User`(username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Company has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE if not exists  ESF (ESFID int(16) NOT NULL AUTO_INCREMENT, description varchar(250) NOT NULL, PRIMARY KEY (ESFID))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table ESF has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE if not exists CostUnit (unit varchar(50) NOT NULL, PRIMARY KEY (unit))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table CostUnit has been created");
	    		}
	    	});
	    
	    createTable = 'CREATE TABLE if not exists Resource (resourceID int(16) NOT NULL AUTO_INCREMENT,owner varchar(50) NOT NULL,resource_name varchar(50) NOT NULL,model varchar(50) NOT NULL,latitude float(50) NOT NULL,longitude float(50) NOT NULL,cost varchar(50) NOT NULL, availability varchar(50) DEFAULT "available",available_date datetime DEFAULT now(),maximum_distance int(16) NOT NULL,PRIMARY KEY (resourceID),CONSTRAINT chk_cost CHECK (cost >= 0), CONSTRAINT fk_Resource_owner_User_username FOREIGN KEY (owner) REFERENCES `User`(username))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Resource has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE if not exists Declaration (Type varchar(50) NOT NULL, abbreviation varchar(50) NOT NULL, PRIMARY KEY (abbreviation))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Declaration has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE IF NOT EXISTS ResourceESF(resourceID int(16) NOT NULL,ESFID int(16) NOT NULL,type varchar(50) NOT NULL,PRIMARY KEY  resourceESF(resourceID, ESFID), CONSTRAINT fk_ResourceESF_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID), CONSTRAINT fk_ResourceESF_esfid_esf_esfid FOREIGN KEY (ESFID) REFERENCES `ESF`(ESFID))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table ResourceESF has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE IF NOT EXISTS ResourceCostUnit(resourceID int(16) NOT NULL,unit varchar(50) NOT NULL,PRIMARY KEY  resourceCostUnit(resourceID, unit), CONSTRAINT fk_ResourceCostUnit_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID), CONSTRAINT fk_ResourceCostUnit_unit_CostUnit_unit FOREIGN KEY (unit) REFERENCES `CostUnit`(unit))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table ResourceCostUnit has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE IF NOT EXISTS Capabilities(resourceID int(16) NOT NULL,capability int(16) NOT NULL,PRIMARY KEY  resourceCapability(resourceID, capability), CONSTRAINT fk_Capabilities_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Capabilities has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE IF NOT EXISTS Incident (count_number int(16) NOT NULL, owner varchar(50) NOT NULL,abbreviation varchar(50) NOT NULL,description varchar(500) NOT NULL,date datetime NOT NULL,latitude float(53) NOT NULL,longitude float(53) NOT NULL,  incidentID varchar(50) AS (CONCAT(abbreviation, "-", count_number)) STORED NOT NULL,PRIMARY KEY (incidentID), CONSTRAINT fk_Incident_owner_User_username FOREIGN KEY (owner) REFERENCES `User`(username), CONSTRAINT fk_Incident_abbreviation_Declaration_abbreviation FOREIGN KEY (abbreviation) REFERENCES `Declaration`(abbreviation))';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Incident has been created");
	    		}
	    	});
	    createTable = 'CREATE TABLE IF NOT EXISTS Request(resourceID int(16) NOT NULL,incidentID varchar(50) NOT NULL,start_date datetime NULL,return_by datetime NOT NULL,status varchar(50) NOT NULL,PRIMARY KEY requestID(resourceID,incidentID), CONSTRAINT fk_Request_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT fk_Request_incidentID_Incident_incidentID FOREIGN KEY (incidentID) REFERENCES `Incident`(incidentID) ON DELETE CASCADE ON UPDATE CASCADE)';
	    connection.query(createTable, function(err) {
	    		if(err) {
	    			console.log(err);
	    		}else{
	    			console.log("Table Request has been created");
	    		}
	    	});
	    //preload User table with usernames: binwei, huanchen, shanshanwang, guanwang
		connection.query('select * from User', function(err, result, fields){
			// console.log(result);
			if (err){
				return console.log(err);
			}
			if(result.length  == 0){
				let individual = {username: 'cs6400', name: 'cs 6400', type:'individual', job_title:'student', date_hired: new Date('August 10, 2014')};
				let municipality = {username: 'newyorkcity', name: 'City of New York', category: 'City', type:'municipality'};
				let government = {username: 'fbi', name:'FBI', agency_name: 'Federal Bureau of Investigation', local_office: 'Atlanta',type:'government'};
				let company = {username: 'google', name:'Google', headquarter:' Mountain View', num_of_employees: 85000, type:'company'}
				let password = '123456';
				let users = [individual, municipality, government, company];
				users.forEach(function(user){
					bcrypt.genSalt(10, (err, salt)=> {
					bcrypt.hash(password, salt, (err, hash)=> {
						if(err) {
							return console.log(err);
						}
						password = hash;
						console.log(password);
						
						connection.query("insert into User(username, name, password, type) values(?, ?, ?, ?)", [user.username, user.name, password, user.type], function(err) {
							if(err) {
								console.log(err);
							}
						});
						switch(user.type){
							case 'company':
								connection.query("insert into Company(username, headquarter, num_of_employees) values(?, ?, ?)", [user.username, user.headquarter, user.num_of_employees], function(err){
									if(err){
										return console.log(err);
									}
								});
								break;
							case 'municipality':
								connection.query("insert into Municipality(username, category) values(?, ?)", [user.username, user.category], function(err){
									if(err){
										return console.log(err);
									}
								});
								break;
							case 'government':
								connection.query("insert into Government(username, agency_name, local_office) values(?, ?, ?)", [user.username, user.agency_name, user.local_office], function(err){
									if(err){
										return console.log(err);
									}
								});
								break;
						}
						
					});
				});
				})
				};
			});
		connection.query("select * from ESF", function(err, result){
			if(err){
				return console.log(err);
			}
			if(result.length == 0){
				let resources = [['1', 'Transportation'], ['2', 'Communications'], ['3', 'Public Works and Engineering'], ['4', 'Firefighting'], ['5', 'Emergency Management'],
				['6', 'Mass Care, Emergency Assistance, Housing, and Human Services'], ['7', 'Logistics Management and Resource Support'], 
				['8', 'Public Health and Medical Services'], ['9', 'Search and Rescue'], ['10', 'Oil and Hazardous Materials Response'], ['11', 'Agriculture and Natural Resources'],
				['12', 'Energy'], ['13', 'Public Safety and Security'], ['14', 'Long-Term Community Recovery'], ['15', 'External Affairs']];
				let sql = "Insert into ESF (ESFID, description) VALUES ?";
				connection.query(sql, [resources], function(err){
					if(err){
						return console.log(err);
					}
				})
			}
		});

		connection.query("select * from CostUnit", function(err, result){
			if(err){
				return console.log(err);
			}
			if(result.length == 0){
				let units = [['Week'], ['Day'], ['Hour'], ['Each']];
				let sql = "Insert into CostUnit(unit) VALUES ?";
				connection.query(sql, [units], function(err){
					if(err){
						return console.log(err);
					}
				})
			}
		});

		connection.query("select * from Declaration", function(err, result){
			if(err){
				return console.log(err);
			}
			if(result.length == 0){
				let declarations = [['Major Disaster','MD'], ['Emergency','ED'],['Fire Management Assistance','FM'],
				['Fire Suppression Authorization','FS']];
				let sql = "Insert into Declaration(Type, abbreviation) VALUES ?";
				connection.query(sql, [declarations], function(err){
					if(err){
						return console.log(err);
					}
				})
			}
		})
	
	    // IF NOT EXISTS (SELECT NULL FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME   = `fk_Individual_username_User_username` AND CONSTRAINT_TYPE   = `FOREIGN KEY`) THEN 
	    // alterTable = 'ALTER TABLE Individual ADD CONSTRAINT fk_Individual_username_User_username FOREIGN KEY (username) REFERENCES `User`(username)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint individual added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Municipality ADD CONSTRAINT fk_Municipality_username_User_username FOREIGN KEY (username) REFERENCES `User`(username)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Municipality added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Government ADD CONSTRAINT fk_Government_username_User_username FOREIGN KEY (username) REFERENCES `User`(username)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Government added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Company ADD CONSTRAINT fk_Company_username_User_username FOREIGN KEY (username) REFERENCES `User`(username)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Company added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Resource ADD CONSTRAINT fk_Resource_owner_User_username FOREIGN KEY (owner) REFERENCES `User`(username)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Resource added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE ResourceESF ADD CONSTRAINT fk_ResourceESF_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID), ADD CONSTRAINT fk_ResourceESF_esfid_esf_esfid FOREIGN KEY (ESFID) REFERENCES `ESF`(ESFID)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint ResourceESF added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE ResourceCostUnit ADD CONSTRAINT fk_ResourceCostUnit_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID),ADD CONSTRAINT fk_ResourceCostUnit_unit_CostUnit_unit FOREIGN KEY (unit) REFERENCES `CostUnit`(unit)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint ResourceCostUnit added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Capabilities ADD CONSTRAINT fk_Capabilities_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Capabilities added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Incident ADD CONSTRAINT fk_Incident_owner_User_username FOREIGN KEY (owner) REFERENCES `User`(username), ADD CONSTRAINT fk_Incident_abbreviation_Declaration_abbreviation FOREIGN KEY (abbreviation) REFERENCES `Declaration`(abbreviation)';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Incident added");
	    // 		}
	    // 	});
	    // alterTable = 'ALTER TABLE Request ADD CONSTRAINT fk_Request_resourceID_Resource_resourceID FOREIGN KEY (resourceID) REFERENCES `Resource`(resourceID) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT fk_Request_incidentID_Incident_incidentID FOREIGN KEY (incidentID) REFERENCES `Incident`(incidentID) ON DELETE CASCADE ON UPDATE CASCADE';
	    // connection.query(alterTable, function(err) {
	    // 		if(err) {
	    // 			console.log(err);
	    // 		}else{
	    // 			console.log("constraint Request added");
	    // 		}
	    // 	});

	});

});

module.exports = connection;