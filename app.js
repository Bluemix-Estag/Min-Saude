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
var moment = require('moment');
var chatbot_acolhimento = require('./config/bot-acolhimento.js');
var chatbot_doutor = require('./config/bot-doutor.js');
// load local VCAP configuration
var vcapLocal = null;
var appEnv = null;
var appEnvOpts = {};
var discovery = require('./config/discovery.js');

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
var dbname = "my_db_dev";
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

app.get('/getPatient', function (req, res) {
    var sus = req.query.sus;
    res.setHeader('Content-Type', 'application/json');
    database.get('patients', {
        revs_info: true
    }, function (err, doc) {
        if (err) {
            console.log(err);
            res.status(500).json({ error: true, description: "Internal server error", status: 500 });
        } else {
            var patient = null;
            var patients = doc.patients;
            for (var p of patients) {
                if (p.sus == sus) {
                    patient = p;
                    console.log("Patient: " + JSON.stringify(patient));
                    break;
                }
            }
            if (patient != null) {
                res.status(200).json(patient);
            } else {
                res.status(404).json({ error: true, description: "Patient not found", status: 404 });
            }
        }
    })
});

app.get('/getPatientAgenda', function (req, res) {
    var sus = req.query.sus;
    res.setHeader('Content-Type', 'application/json');
    database.get('patients', {
        revs_info: true
    }, function (err, doc) {
        if (err) {
            res.status(500).json({ error: true, description: "Internal server error", status: 500 });
        } else {
            var patients = doc.patients;
            var now = moment().unix() * 1000;
            var patient = -1;
            var atividades = [];
            for (var p in patients) {
                if (patients[p].sus == sus) {
                    patient = p;
                    if (patients[p].atividades.length > 0) {
                        for (var atividade in patients[p].atividades) {
                            console.log('atividade.date: ' + patients[p].atividades[atividade].date + ' now: ' + now);
                            if (patients[p].atividades[atividade].date >= now) {
                                atividades.push(patients[p].atividades[atividade]);
                            }
                        }
                    }
                    break;
                }
            }
            if (patient != -1) {
                patient = patients[patient];
                patient.atividades = atividades;
                res.status(200).json(patient);
            } else {
                res.status(404).json({ error: true, description: "Patient not found", status: 404 });
            }
        }
    })
});


app.get('/getCID',function(req,res){
    var result = null;
    var cid_user = req.query.cid;
    var doenca_original = req.query.doenca;//o que o bot mandou
    database.get('cid', {
        revs_info:true
    },function(err,doc){
        var cids = doc.cids;
        for(var cid of cids){
            if(cid_user === (Object.keys(cid)[0])){
                result = cid[(Object.keys(cid)[0])];
                var new_result = result.toLowerCase();
                //verifica se a descricao do cid encontrado tem doenca original
                if(new_result.indexOf(doenca_original) != -1 || result.indexOf(doenca_original) != -1){
                    var same_cid = true;
                }else{
                    //error avisar o medico 
                    var same_cid = false;
                }
                break;
            }
        }
        if(result != null){
            res.status(200).json({error: false, result,same_cid});
        }else{
            res.status(404).json({error: true,message: "Não encontrado."});
        }
    })
});


// =============================
// ROUTING METHODS==============
// =============================

app.get('/triagem', function (req, res) {
    res.render('index.html');
});

app.get('/recepcao', function (req, res) {
    res.render('acolhimento.html');
});

app.get('/', function (req, res) {
    res.render('login.html');
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard.html');
});

app.get('/doutor', function (req, res) {
    res.render('doutor.html');
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard.html');
});

// =====================================
// WATSON CONVERSATION  ================
// =====================================
app.post('/api/watson/triagem', function (req, res) {
    processChatMessage_triagem(req, res);
}); // End app.post 
function processChatMessage_triagem(req, res) {
    chatbot.sendMessage(req, function (err, data) {
        if (err) {
            console.log("Error in sending message: ", err);
            res.status(err.code || 500).json(err);
        }
        else {
            var context = data.context;
            res.status(200).json(data);
        }
    });
}

app.post('/api/watson/acolhimento', function (req, res) {
    processChatMessage_acolhimento(req, res);
}); // End app.post 
function processChatMessage_acolhimento(req, res) {
    chatbot_acolhimento.sendMessage(req, function (err, data) {
        if (err) {
            console.log("Error in sending message: ", err);
            res.status(err.code || 500).json(err);
        }
        else {
            var context = data.context;
            res.status(200).json(data);
        }
    });
}

app.post('/api/watson/doutor', function (req, res) {
    processChatMessage_doutor(req, res);
}); // End app.post 
function processChatMessage_doutor(req, res) {
    chatbot_doutor.sendMessage(req, function (err, data) {
        if (err) {
            console.log("Error in sending message: ", err);
            res.status(err.code || 500).json(err);
        }
        else {
            var context = data.context;
            if (context.search != null && context.show_search == true) {
                database.get('doencas', {
                    revs_info: true
                }, function (err, doc) {
                    if (err) {
                        context['result'] = "null";
                    } else {
                        if (doc.doencas[context.search] != null) {
                            context['result'] = doc.doencas[context.search];
                        } else {
                            context['result'] = {};
                            context['result']['errMsg'] = "Ainda não fui treinado para isso, mas gostaria de aprender :)";
                        }
                    }
                    data.context = context;

                    res.status(200).json(data);
                });


            } else if (context.search_sintomas != null && context.show_search_sintomas == true) {
                database.get('doencas', {
                    revs_info: true
                }, function (err, doc) {
                    if (err) {
                        context['result_sintomas'] = "null";
                    } else {
                        if(doc.doencas[context.search_sintomas] != null ){
                        context['result_sintomas'] = doc.doencas[context.search_sintomas];
                    }else{
                        context['result_sintomas'] = {};
                            context['result_sintomas']['errMsg'] = "Ainda não fui treinado para isso, mas gostaria de aprender :)";
                        }
                    }
                    data.context = context;
                    res.status(200).json(data);
                });
            } else if (context['searchDB'] != null && context['showDB'] == true) {
                database.get('doencas', {
                    revs_info: true
                }, function (err, doc) {
                    if (err) {
                        context['result_search'] = "null";
                    } else {
                        if( doc.doencas[context.searchDB] != null){
                        context['result_search'] = doc.doencas[context.searchDB];
                    }else{
                        context['result_search'] = {};
                            context['result_search']['errMsg'] = 'Ainda não fui treinado para isso, mas gostaria de aprender :)';
                        }
                    }
                    data.context = context;
                    res.status(200).json(data);
                });
            } else {
                res.status(200).json(data);
            }
        }
    });
}

// ==========================
// DISCOVERY METHODS ========
// ==========================

app.get('/api/watson/discovery', function (req, res) {
    var query = req.query.q;
    discovery.query(query, function (err, data) {
        if (err) {
            console.log("Error in discovery service", err);
            res.status(err.code || 500).json(err);
        }
        else {
            res.status(200).json(data);
        }
    });
});






http.listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});