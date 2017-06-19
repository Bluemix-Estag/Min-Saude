var params = {},
    watson = 'Watson',
    context;
var patientName;
var patientSus;
var type;


function userMessage(message) {

    params.text = message;
    if (context) {
        params.context = context;
    }
    var xhr = new XMLHttpRequest();
    var uri = '/api/watson/triagem';
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        // Verify if there is a success code response and some text was sent
        if (xhr.status === 200 && xhr.responseText) {
            var response = JSON.parse(xhr.responseText);
            text = response.output.text; // Only display the first response
            context = response.context; // Store the context for next round of questions
            console.log("Got response from Ana: ", JSON.stringify(response));


            if (context['show_history'] == true) {
                showHistory(context['info'].SUS_number);
                context['show_history'] = false;
            }

            // Triagem
            if (context['triagem'] == true) {
                context['triagem'] = false;
                startScreening();
            }
            if (context['info'] != null) {
                if (context['info'].freq_card != null) {
                    setTimeout(function () {
                        $('#frequencia').val(context['info']['freq_card']);
                        $('#freq').removeClass('hide');
                        $('#frequencia').addClass('animated bounceInRight');
                    }, 1000)

                }
                if (context['info']['pressaoD']) {
                    var pressao = context['info']['pressaoN'] + " / " + context['info']['pressaoD'];
                    $('#pressao').val(pressao);
                    $('#press').removeClass('hide');
                    $('#pressao').addClass('animated bounceInRight');
                }
                if (context['info']['temperatura'] && context['info']['temperatura'] != null) {
                    $('#temperatura').val(context['info']['temperatura']);
                    $('#temp').removeClass('hide');
                    $('#temperatura').addClass('animated bounceInRight');
                }
                if (context['info']['glicemia'] && context['info']['glicemia'] != null) {
                    $('#glicemia').val(context['info']['glicemia']);
                    $('#glic').removeClass('hide');
                    $('#glicemia').addClass('animated bounceInRight');
                }
                if (context['info']['o2'] && context['info']['o2'] != null) {
                    $('#o2').val(context['info']['o2']);
                    $('#co2').removeClass('hide');
                    $('#o2').addClass('animated bounceInRight');
                }
                if (context['info']['dor'] == true || context['info']['dor'] == false) {
                    if (context['info']['dor'] == true) {
                        $('#dor').val("Sim");
                    } else {
                        $('#dor').val("Não");
                    }
                    $('#dor-peito').removeClass('hide');
                    $('#dor').addClass('animated bounceInRight');
                }
            }
            if (context['analise'] == true) {
                typeOfPatient(context['atendimento']);
            }

            //
            console.log(JSON.stringify(text));
            for (var txt in text) {
                displayMessage(text[txt], watson);
            }

        } else {
            console.error('Server error for Conversation. Return status of: ', xhr.statusText);
            displayMessage("Ops.. um erro ocorreu! Você pode tentar novamente.", watson);
        }
    };
    xhr.onerror = function () {
        console.error('Network error trying to send message!');
        displayMessage("Ops, acho que meu cérebro está offline. Espera um minutinho para continuarmos por favor.", watson);
    };
    console.log(JSON.stringify(params));
    xhr.send(JSON.stringify(params));
}

function showHistory(sus_number) {

    xhrGet('/getPatient?sus=' + sus_number, function (data) {
        $('#row-historico').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
        $('#nome').val(data.nome);
        $('#paciente-nome').val(data.nome);
        $('#sus').val(data.sus);
        $('#paciente-sus').val(data.sus);
        $('#idade').val(data.idade);
        $('#situacao').val(data.situacao);
        context.sus_valido = true;
        userMessage('sus_valido');
    }, function (err) {
        console.log(err);
        if (err.status == 404) {
            context.sus_valido = false;
            userMessage('sus_invalido');
        }

    })
}


function startScreening() {
    $('#row-triagem').removeClass('hide');
    $('#triagem').addClass('animated bounceInUp');
}

function typeOfPatient(type) {
    type = type.substring(0, 1).toUpperCase() + type.substring(1);
    $('#tipo-atendimento').val(type);
    // $('#historico').addClass('animated bounceOutDown');
    setTimeout(function(){
        $('#triagem').addClass('animated bounceOutDown');
    },1000);
    setTimeout(function () {
        $('#historico').addClass('animated bounceOutDown');
        // $('#triagem').addClass('animated bounceOutDown');
    }, 2000);
    setTimeout(function () {
        $('#loading-atendimento').removeClass('hide');
    }, 1000);
    setTimeout(function () {
        $('#loading-atendimento').addClass('hide');
        $('#row-atendimento').removeClass('hide');
        $('#atendimento').addClass('animated bounceInUp');
        var color = (type=='Imediato')?'red':(type=='Prioritario')?'yellow':'#fff';
        $('#tipo-atendimento').css('color',color);
    }, 3000);
}

function newEvent(event) {
    // Only check for a return/enter press - Event 13
    if (event.which === 13 || event.keyCode === 13) {
        var userInput = document.getElementById('chatInput');
        text = userInput.value; // Using text as a recurring variable through functions
        text = text.replace(/(\r\n|\n|\r)/gm, ""); // Remove erroneous characters
        // If there is any input then check if this is a claim step
        // Some claim steps are handled in newEvent and others are handled in userMessage
        if (text) {
            // Display the user's text in the chat box and null out input box
            //            userMessage(text);
            displayMessage(text, 'user');
            userInput.value = '';
            userMessage(text);
        } else {
            // Blank user message. Do nothing.
            console.error("No message.");
            userInput.value = '';
            return false;
        }
    }
}

function displayMessage(text, user) {
    var chat_body = document.getElementById('chat-body');
    var bubble = document.createElement('div');
    bubble.setAttribute("class", "bubble");
    if (user == "user") {
        bubble.className += " user";
    } else {
        bubble.className += " watson";
    }
    bubble.innerHTML = text;
    chat_body.appendChild(bubble);
    chat_body.scrollTop = chat_body.scrollHeight;
}

function displayMaps(watson) {
    var chat_body = document.getElementById('chat-body');
    var bubble = document.createElement('div');
    bubble.innerHTML += '<iframe width = "350px" height = "170px" frameborder = "0" style="border:0;" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCzFkRQ3y5QUWILwMttySU7MFGS-mWakOw&q=UFABC&zoom=12" allowfullscreen></iframe>';
    chat_body.appendChild(bubble);
    chat_body.scrollTop = chat_body.scrollHeight; // Move chat down to the last message displayed
    document.getElementById('chatInput').focus();
}


userMessage('');