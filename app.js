/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');
var app = express();
var cfenv = require('cfenv');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http').createServer(app);
var socketIO = require('socket.io')(http);
var request = require('request');
var chatbot = require('./config/bot.js');
// load local VCAP configuration
var vcapLocal = null;
var appEnv = null;
var appEnvOpts = {};

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));
app.use('/scripts', express.static(path.join(__dirname, '/views/scripts')));



app.set('port', process.env.PORT || 3000);

fs.stat('./vcap-local.json', function (err, stat) {
    if (err && err.code === 'ENOENT') {
        // file does not exist
        console.log('No vcap-local.json');
        initializeAppEnv();
    } else if (err) {
        console.log('Error retrieving local vcap: ', err.code);
    } else {
        vcapLocal = require("./vcap-local.json");
        console.log("Loaded local VCAP", vcapLocal);
        appEnvOpts = {
            vcap: vcapLocal
        };
        initializeAppEnv();
    }
});


// get the app environment from Cloud Foundry, defaulting to local VCAP
function initializeAppEnv() {
    appEnv = cfenv.getAppEnv(appEnvOpts);
    if (appEnv.isLocal) {
        require('dotenv').load();
    }
    if (appEnv.services.cloudantNoSQLDB) {
        initCloudant();
    } else {
        console.error("No Cloudant service exists.");
    }
}


// =====================================
// CLOUDANT SETUP ======================
// =====================================
var dbname = "my_db";
var database;

function initCloudant() {
    var cloudantURL = appEnv.services.cloudantNoSQLDB[0].credentials.url || appEnv.getServiceCreds("min-saude-cloudantNoSQLDB").url;
    var Cloudant = require('cloudant')({
        url: cloudantURL,
        plugin: 'retry',
        retryAttempts: 10,
        retryTimeout: 500
    });
    // Create the accounts Logs if it doesn't exist
    Cloudant.db.create(dbname, function (err, body) {
        if (err && err.statusCode == 412) {
            console.log("Database already exists: ", dbname);
        } else if (!err) {
            console.log("New database created: ", dbname);
        } else {
            console.log('Cannot create database!');
        }
    });
    database = Cloudant.db.use(dbname);

}
// =============================
// CLOUDANT METHODS=============
//==============================

app.get('/getPatient', function(req,res){
    var sus = req.query.sus;
    res.setHeader('Content-Type','application/json');
    database.get('patients', {
        revs_info: true
    },function(err,doc){
        if(err){
            console.log(err);
            res.status(500).json({error: true, description: "Internal server error",status:500});
        }else{
            var patient = null;
            var patients = doc.patients;
            for(var p of patients){
                if(p.sus == sus){
                    patient = p;
                    console.log("Patient: " + JSON.stringify(patient));
                    break;
                }
            }
            if(patient != null){
                res.status(200).json(patient);
            }else{
                res.status(404).json({error: true, description : "Patient not found",status:404});
            }
        }
    })
}); 

 
 
// =============================
// ROUTING METHODS==============
// =============================

app.get('/index', function (req, res) {
    res.render('index.html');
})

app.get('/acolhimento', function(req,res){
    res.render('acolhimento.html');
})

app.get('/', function (req, res) {
    res.render('login.html');
})

// =====================================
// WATSON CONVERSATION  ================
// =====================================
app.post('/api/watson', function (req, res) {
    processChatMessage(req, res);
}); // End app.post 
function processChatMessage(req, res) {
    chatbot.sendMessage(req, function (err, data) {
        if (err) {
            console.log("Error in sending message: ", err);
            res.status(err.code || 500).json(err);
        }
        else {
            var context = data.context;
//            var owner = req.user.username;
            res.status(200).json(data);
        }
    });
}







http.listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});