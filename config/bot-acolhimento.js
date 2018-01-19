var watson = require('watson-developer-cloud');
var WORKSPACE_ID = "e0c50eb3-2132-4fde-92aa-d2b7b6fd6e49";
var cfenv = require('cfenv');
var chrono = require('chrono-node');
var appEnvOpts_a = {};
var conversationWorkspace_a, conversation_a;


require('dotenv').load()
initConversation()

// =====================================
// CREATE THE SERVICE WRAPPER ==========
// =====================================
// Create the service wrapper
function initConversation() {
    var conversationUsername_a = process.env.CONVERSATION_USERNAME
    var conversationPassword_a = process.env.CONVERSATION_PASSWORD
    var conversationURL_a = process.env.CONVERSATION_URL
    conversation_a = watson.conversation({
        url: conversationURL_a,
        username: conversationUsername_a,
        password: conversationPassword_a,
        version_date: '2017-04-10',
        version: 'v1'
    });
}
var request = require('request');
// =====================================
// REQUEST =====================
// =====================================
// Allow clients to interact
var chatbot_acolhimento = {
sendMessage: function (req, callback) {
    //        var owner = req.user.username;
    buildContextObject(req, function (err, params) {
            if (err) {
                console.log("Error in building the parameters object: ", err);
                return callback(err);
            }
            if (params.message) {
                var conv = req.body.context.conversation_id;
                var context = req.body.context;
                var res = {
                    intents: [],
                    entities: [],
                    input: req.body.text,
                    output: {
                        text: params.message
                    },
                    context: context
                };
                //                chatLogs(owner, conv, res, () => {
                //                    return 
                callback(null, res);
                //                });
            } else if (params) {
                // Send message to the conversation service with the current context
                conversation_a.message(params, function (err, data) {
                    if (err) {
                        console.log("Error in sending message: ", err);
                        return callback(err);
                    } else {

                        var conv = data.context.conversation_id;
                        console.log("Got response from Ana: ", JSON.stringify(data));
                        callback(null, data);
                    }
        });
            }
    })
}
};

// ===============================================
// LOG MANAGEMENT FOR USER INPUT FOR ANA =========
// ===============================================

// ===============================================
// UTILITY FUNCTIONS FOR CHATBOT AND LOGS ========
// ===============================================
/**
 * @summary Form the parameter object to be sent to the service
 *
 * Update the context object based on the user state in the conversation and
 * the existence of variables.
 *
 * @function buildContextObject
 * @param {Object} req - Req by user sent in POST with session and user message
 */
function buildContextObject(req, callback) {
    var message = req.body.text;
    //    var userTime = req.body.user_time;
    var context;
    if (!message) {
        message = '';
    }
    // Null out the parameter object to start building
    var params = {
        workspace_id: process.env.CONVERSATION_WORKSPACEC,
        input: {},
        context: {}
    };


    if (req.body.context) {
        context = req.body.context;
        params.context = context;
    } else {
        context = '';
    }
    // Set parameters for payload to Watson Conversation
    params.input = {
        text: message // User defined text to be sent to service
    };
    // This is the first message, add the user's name and get their healthcare object
    //    if ((!message || message === '') && !context) {
    //        params.context = {
    //            fname: req.user.fname
    //            , lname: req.user.lname
    //        };
    //    }
    return callback(null, params);
}
module.exports = chatbot_acolhimento;
