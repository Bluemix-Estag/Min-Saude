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
            // console.log("Got response from Ana: ", JSON.stringify(response));

            
            if (context['show_history'] == true) {
                showHistory(context['patient'].sus);
                context['show_history'] = false;
            }

            // Triagem
            if (context['triagem'] == true) {
                context['triagem'] = false;
                startScreening();
            }
            if (context['info'] != null) {
                if (context['info'].queixa != null) {
                    reason(context['info']['queixa']);
                }

                if (context['info']['tempo'] != null) {
                    periodReason(context['info'].tempo);
                }

                if (context['info'].gravida != null) {
                    setTimeout(function () {
                        $('#gravida').val(context['info']['gravida']);
                        $('#grav').removeClass('hide');
                        $('#gravida').addClass('animated bounceInRight');
                    }, 1000)
                }

                if (context['info'].freq_card != null) {
                    setTimeout(function () {
                        $('#cardiaca').val(context['info']['freq_card']);
                        $('#freq_card').removeClass('hide');
                        $('#cardiaca').addClass('animated bounceInRight');

                        fixScrollTriagem();
                    }, 1000)

                }
                if (context['info']['pressaoD']) {
                    var pressao = (context['info']['pressaoN'] * 10 ) + " x " + ( context['info']['pressaoD'] * 10 );
                    $('#pressao').val(pressao);
                    $('#press').removeClass('hide');
                    $('#pressao').addClass('animated bounceInRight');
                    fixScrollTriagem();
                }
                if (context['info']['temperatura'] && context['show_temp'] == true) {
                    var temp = (typeof context['info']['temperatura'] != 'number' && context['info']['temperatura'].split(' ').length>1)?context['info']['temperatura'].split(' ').join('.'):context['info']['temperatura'];
                    temp = parseFloat(temp);
                    context['info']['temperatura'] = temp;
                    $('#temperatura').val(temp);
                    $('#temp').removeClass('hide');
                    $('#temperatura').addClass('animated bounceInRight');
                     context['show_temp'] = false;
                }
                if (context['info']['glicemia'] && context['info']['glicemia'] != null) {
                    $('#glicemia').val(context['info']['glicemia']);
                    $('#glic').removeClass('hide');
                    $('#glicemia').addClass('animated bounceInRight');
                }
                if (context['info']['freq_resp']) {
                    $('#respiratoria').val(context['info']['freq_resp']);
                    $('#freq_resp').removeClass('hide');
                    $('#respiratoria').addClass('animated bounceInRight');
                }
                if (context['info']['dor'] == true || context['info']['dor'] == false) {
                    if (context['info']['dor'] == true) {
                        $('#dor_peito').val("Sim");
                    } else {
                        $('#dor_peito').val("Não");
                    }
                    $('#dor').removeClass('hide');
                    $('#dor').addClass('animated bounceInRight');
                }
                if (context['info']['o2']) {
                    $('#saturacao').val(context['info']['o2']);
                    $('#satur').removeClass('hide');
                    $('#saturacao').addClass('animated bounceInRight');
                }
                if(context['info']['tabagista'] != null){
                    $('#tabagista').val(context['info']['tabagista']);
                    $('#tabag').removeClass('hide');
                    $('#tabagista').addClass('animated bounceInRight');
                }
                if(context['info']['diabetes'] != null){
                    $('#diabetes').val(context['info']['diabetes']);
                    $('#diabe').removeClass('hide');
                    $('#diabetes').addClass('animated bounceInRight');
                }

                
                if(context['info']['programa'] != null ){
                    $('#prog-tabagista').val((context['info']['programa']== true)?"Sim":"Não");
                    $('#prog-tabag').removeClass('hide');
                    $('#prog-tabagista').addClass('animated bounceInRight');

                }
            }



            if (context['analise'] == true) {
                typeOfPatient(context['atendimento']);
                pacienteAtendido();
            }



            //
            // console.log(JSON.stringify(text));
            for (var txt in text) {
                displayMessage(text[txt], watson);
            }

        } else {
            console.error('Server error for Conversation. Return status of: ', xhr.statusText);
            displayMessage("Um erro ocorreu.Tente novamente mais tarde.", watson);
        }
    };
    xhr.onerror = function () {
        console.error('Network error trying to send message!');
        displayMessage("Meu servidor está offline. Espere alguns instantes para continuar por favor.", watson);
    };
    // console.log(JSON.stringify(params));
    xhr.send(JSON.stringify(params));
}

function fixScrollTriagem(){
    var list = document.getElementById('triagem');
    list.scrollTop = list.scrollHeight;
}

function showHistory(sus_number) {

    xhrGet('/getPatient?sus=' + sus_number, function (data) {
        $('#historico').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
        $('#nome').val(data.nome);
        $('#paciente-nome').val(data.nome);
        $('#sus').val(data.sus);
        $('#paciente-sus').val(data.sus);
        $('#idade').val(context['patient'].idade);
        $('#genero').val(data.sexo);
    }, function (err) {
        console.log(err);
        if (err.status == 404) {
            context.sus_valido = false;
            userMessage('sus_invalido');
        }

    })
}

function setScreening(id, value,label) {
    setTimeout(function () {
        $('#lista-triagem').append('<div class="input-field">'+
            '<input disabled value="' + value + '" id="' + id + '" type="text" class="validate" style="color: #fff;">' +
            '<label for="'+id+'" style="color: #fff;" id="'+id+'_label">'+label+'</label></div>');
    }, 4000);

}

function startScreening() {
    $('#triagem').removeClass('hide');
    $('#triagem').addClass('animated bounceInUp');
}

function typeOfPatient(type) {
    type = type.substring(0, 1).toUpperCase() + type.substring(1);
    // alert("Entrou no type");
    $('#tipo-atendimento').val(type);
    // $('#historico').addClass('animated bounceOutDown');
    setTimeout(function () {
        $('#triagem').addClass('animated bounceOutDown');
    }, 3000);
    setTimeout(function () {
        $('#historico').addClass('animated bounceOutDown');
        // $('#triagem').addClass('animated bounceOutDown');
    }, 4000);
    setTimeout(function () {
        $('#queixa').addClass('animated bounceOutDown');
        // $('#triagem').addClass('animated bounceOutDown');
    }, 4000);

    setTimeout(function () {
        $('#queixa_holder').addClass('hide');
        $('#triagem_holder').addClass('hide');
        $('#historico_holder').addClass('hide');
        $('#loading-atendimento').removeClass('hide');
    }, 3000);
    setTimeout(function () {
        
        $('#loading-atendimento').addClass('hide');
        $('#atendimento').removeClass('hide');
        $('#atendimento').addClass('animated bounceInUp');
        var color = (type == 'Imediato') ? 'red' : (type == 'Prioritario') ? 'yellow' : '#fff';
        $('#tipo-atendimento').css('color', color);
    }, 4000);
}

function reason(queixas) {
    document.getElementById('queixa').className  += ' animated bounceInRight';
    $('#queixa').addClass('animated bounceInRight');
    $('#queixa').removeClass('hide');
    $('#queixa_value').html(queixas);
    $('#queixa_value').addClass('animated bounceInRight');
}

function periodReason(periodo) {
    $('#queixa_tempo_holder').removeClass('hide');
    $('#queixa_tempo').html(periodo);
    $('#queixa_tempo').addClass('animate bounceInRight');
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


// userMessage('');



function getInfo(element) {
    document.getElementById('proximo-nome').innerHTML = element.firstChild.innerHTML.split('-')[0];
    document.getElementById('proximo-sus').value = element.firstChild.getAttribute('data-sus');
}

function iniciarAtendimento() {
    var sus = document.getElementById('proximo-sus').value;
    context = (context === undefined) ? {} : context;
    xhrGet('/getPatient?sus=' + sus, function (data) {
        context['patient'] = data;
        context['init_triagem'] = true;
        context['sus_valid'] = true;
        userMessage('test');
        $('.collapsible').collapsible('open', 0);
        $('#espera').removeClass('bounceInUp');
        $('#espera').addClass('fadeOutUp');
        $('#espera').addClass('hide');
        // $('#row-espera').addClass('hide');

    }, function (err) {


        context['init_triagem'] = false;
        context['sus_valid'] = false;
        userMessage('test-error');
        $('.collapsible').collapsible('open', 0);
    })
}


var local_list = [];
var waiting_list = [];

function receberLista() {
    xhrGet('https://ministerio-saude-apis.mybluemix.net/getWaiting', function (data) {

        var patients = data['patients'];
        waiting_list = getWaitingList(patients, local_list);


        if (waiting_list.length > 0) {
            var i = 1;
            for (var patient of waiting_list) {
                
                $('#lista-espera').append('<div class="col s12"><a href="#modal' + i + '" onclick="getInfo(this)"><div class="waiting_item white-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') + '</div></a></div>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                i++;
            }

            waiting_list = [];
        }
        local_list = patients;

        // console.log(JSON.stringify(data));
    }, function (error) {

    });

    setTimeout(function () {
        receberLista();
    }, 5000);

}
receberLista();

function pacienteAtendido() {
    var first = local_list.shift();
    console.log('passou por aqui');
    document.getElementById('sus_' + first.sus_number).parentElement.remove();
    console.log('passou por aqui 2');
    var result = {
        priority: (context.atendimento == 'imediato')?'3':(context.atendimento == 'prioritario')?'2':'1',
        info: context.info,
        patient: context.patient    
    }
    console.log('passou por aqui 3');
    // alert(JSON.stringify(result));
    xhrPost('https://ministerio-saude-apis.mybluemix.net/checkIn', result, function (data) {
        console.log(JSON.stringify(data));
        console.log('passou por aqui 4');
        // alert(JSON.stringify(data));
    }, function (err) {
        console.log(err);
        // alert(JSON.stringify(err));
    });
    console.log('passou por aqui 5');
}




function getWaitingList(patients, local_list) {
    waiting_list = [];
    for (var i = local_list.length; i < patients.length; i++) {
        waiting_list.push(patients[i]);
    }
    return waiting_list;
}


