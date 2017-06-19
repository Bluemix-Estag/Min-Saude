var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var cfenv = require('cfenv');
var chrono = require('chrono-node');
var fs = require('fs');
// load local VCAP configuration
var vcapLocal = null;
var appEnv = null;
var appEnvOpts = {};

var discoveryService;
fs.stat('./vcap-local.json', function (err, stat) {
    if (err && err.code === 'ENOENT') {
        // file does not exist
        console.log('No vcap-local.json');
        initializeAppEnv();
    } else if (err) {
        console.log('Error retrieving local vcap: ', err.code);
    } else {
        vcapLocal = require("../vcap-local.json");
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
    if (appEnv.services.discovery) {
        initDiscovery();
    } else {
        console.error("No Watson discovery service exists");
    }
}

// =====================================
// CREATE THE SERVICE WRAPPER ==========
// =====================================
// Create the service wrapper
function initDiscovery() {
    var discoveryCredentials = appEnv.getServiceCreds("Discovery-Saude");
    console.log(JSON.stringify(discoveryCredentials));
    console.log(discoveryCredentials);
    var discoveryUsername = process.env.DISCOVERY_USERNAME || discoveryCredentials.username;
    var discoveryPassword = process.env.DISCOVERY_PASSWORD || discoveryCredentials.password;
    discoveryService = new DiscoveryV1({
        username: discoveryUsername,
        password: discoveryPassword,
        version_date: '2016-12-01'
    });


}
var discovery = {
    query: function (req, callback) {

        discoveryService.query({
            environment_id: 'f9d55b62-0856-410c-ac7a-b52d6a2776de',
            collection_id: '0e8ecdf5-2cea-4337-9734-b7fcc9276a30',
            query: 'purple bruises and high fever'
        }, function (err, response) {
            if (err) {
                console.error(err);
                return callback(err);
            } else {
                var output = {

                    title: response.results[0].extracted_metadata.title,
                    text: response.results[0].text
                    
                };

                callback(null, output);
            }
        });

    }
}

module.exports = discovery;
