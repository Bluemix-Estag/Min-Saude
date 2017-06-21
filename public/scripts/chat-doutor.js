$(document).ready(function () {
    $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            // alert("Ready");
            // console.log(modal, trigger);
        },
        complete: function () {
            // alert('Closed');
        } // Callback for Modal close
    });



});

var local_imediato = [];
var local_prioritario = [];
var local_dia = [];


function receberListaDoutor() {
    xhrGet('https://min-saude-apis.mybluemix.net/getDoctorList', function (data) {

        var imediato = data.imediato;
        var prioritario = data.prioritario;
        var dia = data.dia;


        //
        waiting_list_imediato = getWaitingList(imediato, local_imediato);
        waiting_list_prioritario = getWaitingList(prioritario, local_prioritario);
        waiting_list_dia = getWaitingList(dia, local_dia);


        var total_seconds_imediato = 0;
        if (waiting_list_imediato.length > 0) {
            var i = 1;
            for (var patient of waiting_list_imediato) {

                $('#lista-medico-imediato').append('<a href="#modal' + i + '" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
                '<div class="right black-text" id="timeri'+i+'"></div>'+'</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timeri' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds,timer_id);
                total_seconds_imediato += seconds;
            }

            var tempo_medio_imediato = (total_seconds_imediato/waiting_list_imediato.length);
            document.getElementById('imediato_bagde').innerHTML = imediato.length;
            
            // moment(patient.arrival * 1000).format('hh:mm:ss')
            
            waiting_list_imediato = [];
        }
        local_imediato = imediato;

        //
        if (waiting_list_prioritario.length > 0) {
            var i = 1;
            for (var patient of waiting_list_prioritario) {

                $('#lista-medico-prioritario').append('<a href="#modal' + i + '" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
                '<div class="right black-text" id="timerp'+i+'"></div>'+'</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timerp' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds,timer_id);
            }
            document.getElementById('prioritario_badge').innerHTML = prioritario.length;
            waiting_list_prioritario = [];

        }
        local_prioritario = prioritario;
        //
        if (waiting_list_dia.length > 0) {
            var i = 1;
            for (var patient of waiting_list_dia) {

                $('#lista-medico-dia').append('<a href="#modal' + i + '" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
                '<div class="right black-text" id="timerd'+i+'"></div>'+'</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timerd' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds,timer_id);
            }

            



            document.getElementById('dia_badge').innerHTML = dia.length;
            waiting_list_dia = [];
        }
        local_dia = dia;

        console.log(JSON.stringify(data));
    }, function (error) {

    });

    setTimeout(function () {
        receberListaDoutor();
    }, 2000);

}

function getInfo(element) {
    document.getElementById('proximo-nome').innerHTML = element.firstChild.innerHTML.split('-')[0];
    document.getElementById('proximo-sus').value = element.firstChild.getAttribute('data-sus');
}

function getWaitingList(patients, local_list) {
    waiting_list = [];
    for (var i = local_list.length; i < patients.length; i++) {
        waiting_list.push(patients[i]);
    }
    return waiting_list;
}

receberListaDoutor();


function startTreatment() {
    $('#espera-medico-imediato').addClass('animated bounceOutLeft');
    $('#espera-medico-prioritario').addClass('animated bounceOutLeft');
    $('#espera-medico-dia').addClass('animated bounceOutLeft');
    $('#loading-atendimento').removeClass('hide');
    //
    setTimeout(function () {
        $('#row-historico').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
    }, 1000);
    //
    setTimeout(function () {
        $('#row-triagem').removeClass('hide');
        $('#triagem').addClass('animated bounceInUp');
    }, 2000);

    setTimeout(function () {
        $('#row-queixa').removeClass('hide');
        $('#queixa').addClass('animated bounceInUp');
    }, 2500);

    setTimeout(function () {
        $('#row-pre-diagnostico').removeClass('hide');
        $('#pre-diag').addClass('animated bounceInUp');
    }, 3500);
    setTimeout(function () {
        $('#graph').removeClass('hide');

        function drawLine() {
            var ctx2 = document.getElementById('lineChart').getContext('2d');

            var myChart = new Chart(ctx2, {
                type: 'horizontalBar',
                data: {
                    labels: ['Dengue', 'Zika'],
                    datasets: [{
                        label: 'Doenças',
                        data: [40, 30, 20, 0, 100],
                        borderWidth: 0,
                        backgroundColor: ['red', 'green', 'blue']
                    }]
                },
                options: Chart.defaults.global
                // options: {
                //     showLines : true,
                //     spanGaps : false,
                //     responsive: true
                // }
            });
        }
        drawLine();
    }, 4000);
    // setTimeout(function () {
    //     $('#row-diagnostico').removeClass('hide');
    //     // $('#diagnostico').addClass('animated bounceInUp');
    // }, 4250);
    setTimeout(function () {
        $('#row-pre-receita').removeClass('hide');
        $('#pre-receita').addClass('animated bounceInUp');
        $('#row-resumo').removeClass('hide');
        $('#resumo').addClass('animated bounceInUp');
    }, 4250);
    setTimeout(function () {
        $('#loading-atendimento').addClass('hide');
    }, 4750);
}

function setTreatment() {

    $('#row-resumo').addClass('hide');
    $('#pre-receita').addClass('animated bounceOutRight');
    $('#row-receita').removeClass('hide');
    $('#receita').addClass('animated bounceInRight');


    preparePrescription();
}

function preparePrescription() {

}

function countUp(timestamp,id) {
    var timerVar = setInterval(countTimer, 1000);
    var totalSeconds = timestamp;

    function countTimer() {
        ++totalSeconds;
        var hour = Math.floor(totalSeconds / 3600);
        var minute = Math.floor((totalSeconds - hour * 3600) / 60);
        var seconds = totalSeconds - (hour * 3600 + minute * 60);

        document.getElementById(id).innerHTML = hour + ":" + minute + ":" + seconds;
    }
}






// var params = {},
//     watson = 'Watson',
//     context;
// var patientName;
// var patientSus;
// var type;


// function userMessage(message) {

//     params.text = message;
//     if (context) {
//         params.context = context;
//     }
//     var xhr = new XMLHttpRequest();
//     var uri = '/api/watson/triagem';
//     xhr.open('POST', uri, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.onload = function () {
//         // Verify if there is a success code response and some text was sent
//         if (xhr.status === 200 && xhr.responseText) {
//             var response = JSON.parse(xhr.responseText);
//             text = response.output.text; // Only display the first response
//             context = response.context; // Store the context for next round of questions
//             // console.log("Got response from Ana: ", JSON.stringify(response));


//             if (context['show_history'] == true) {
//                 showHistory(context['patient'].sus);
//                 context['show_history'] = false;
//             }

//             // Triagem
//             if (context['triagem'] == true) {
//                 context['triagem'] = false;
//                 startScreening();
//             }
//             if (context['info'] != null) {
//                 if (context['info'].queixa != null) {
//                     reason(context['info']['queixa']);
//                 }

//                 if (context['info'].tempo != null) {
//                     periodReason(context['info'].tempo);
//                 }

//                 if (context['info'].gravida != null) {
//                     setTimeout(function () {
//                         $('#gravida').val(context['info']['gravida']);
//                         $('#grav').removeClass('hide');
//                         $('#gravida').addClass('animated bounceInRight');
//                     }, 1000)
//                 }

//                 if (context['info'].freq_card != null) {
//                     setTimeout(function () {
//                         $('#cardiaca').val(context['info']['freq_card']);
//                         $('#freq_card').removeClass('hide');
//                         $('#cardiaca').addClass('animated bounceInRight');

//                         fixScrollTriagem();
//                     }, 1000)

//                 }
//                 if (context['info']['pressaoD']) {
//                     var pressao = context['info']['pressaoN'] + " / " + context['info']['pressaoD'];
//                     $('#pressao').val(pressao);
//                     $('#press').removeClass('hide');
//                     $('#pressao').addClass('animated bounceInRight');
//                     fixScrollTriagem();
//                 }
//                 if (context['info']['temperatura']) {
//                     $('#temperatura').val(context['info']['temperatura']);
//                     $('#temp').removeClass('hide');
//                     $('#temperatura').addClass('animated bounceInRight');
//                 }
//                 // if (context['info']['glicemia'] && context['info']['glicemia'] != null) {
//                 //     setScreening('glicemia', context['info'].freq_card,'Frequência Cardíaca');
//                 //     // $('#glicemia').val(context['info']['glicemia']);
//                 //     // $('#glic').removeClass('hide');
//                 //     // $('#glicemia').addClass('animated bounceInRight');
//                 // }
//                 if (context['info']['freq_resp']) {
//                     $('#respiratoria').val(context['info']['freq_resp']);
//                     $('#freq_resp').removeClass('hide');
//                     $('#respiratoria').addClass('animated bounceInRight');
//                 }
//                 // if (context['info']['dor'] == true || context['info']['dor'] == false) {

//                 //     // if (context['info']['dor'] == true) {
//                 //     //     $('#dor').val("Sim");
//                 //     // } else {
//                 //     //     $('#dor').val("Não");
//                 //     // }
//                 //     // $('#dor-peito').removeClass('hide');
//                 //     // $('#dor').addClass('animated bounceInRight');
//                 // }
//             }
//             if (context['analise'] == true) {
//                 typeOfPatient(context['atendimento']);
//             }



//             //
//             // console.log(JSON.stringify(text));
//             for (var txt in text) {
//                 displayMessage(text[txt], watson);
//             }

//         } else {
//             console.error('Server error for Conversation. Return status of: ', xhr.statusText);
//             displayMessage("Ops.. um erro ocorreu! Você pode tentar novamente.", watson);
//         }
//     };
//     xhr.onerror = function () {
//         console.error('Network error trying to send message!');
//         displayMessage("Ops, acho que meu cérebro está offline. Espera um minutinho para continuarmos por favor.", watson);
//     };
//     console.log(JSON.stringify(params));
//     xhr.send(JSON.stringify(params));
// }







// function fixScrollTriagem(){
//     var list = document.getElementById('lista-triagem');
//     list.scrollTop = list.scrollHeight;
// }

// function showHistory(sus_number) {

//     xhrGet('/getPatient?sus=' + sus_number, function (data) {
//         $('#row-historico').removeClass('hide');
//         $('#historico').addClass('animated bounceInUp');
//         $('#nome').val(data.nome);
//         $('#paciente-nome').val(data.nome);
//         $('#sus').val(data.sus);
//         $('#paciente-sus').val(data.sus);
//         $('#idade').val(data.idade);
//         $('#genero').val(data.sexo);
//         context.sus_valido = true;
//         // userMessage('sus_valido');
//     }, function (err) {
//         console.log(err);
//         if (err.status == 404) {
//             context.sus_valido = false;
//             userMessage('sus_invalido');
//         }

//     })
// }

// function setScreening(id, value,label) {
//     setTimeout(function () {
//         $('#lista-triagem').append('<div class="input-field">'+
//             '<input disabled value="' + value + '" id="' + id + '" type="text" class="validate" style="color: #fff;">' +
//             '<label for="'+id+'" style="color: #fff;" id="'+id+'_label">'+label+'</label></div>');
//     }, 4000);

// }

// function startScreening() {
//     $('#row-triagem').removeClass('hide');
//     $('#triagem').addClass('animated bounceInUp');
// }

// function typeOfPatient(type) {
//     type = type.substring(0, 1).toUpperCase() + type.substring(1);
//     $('#tipo-atendimento').val(type);
//     // $('#historico').addClass('animated bounceOutDown');
//     setTimeout(function () {
//         $('#triagem').addClass('animated bounceOutDown');
//     }, 1000);
//     setTimeout(function () {
//         $('#historico').addClass('animated bounceOutDown');
//         // $('#triagem').addClass('animated bounceOutDown');
//     }, 2000);
//     setTimeout(function () {
//         $('#queixa').addClass('animated bounceOutDown');
//         // $('#triagem').addClass('animated bounceOutDown');
//     }, 2000);

//     setTimeout(function () {
//         $('#loading-atendimento').removeClass('hide');
//     }, 1000);
//     setTimeout(function () {
//         $('#loading-atendimento').addClass('hide');
//         $('#row-atendimento').removeClass('hide');
//         $('#atendimento').addClass('animated bounceInUp');
//         var color = (type == 'Imediato') ? 'red' : (type == 'Prioritario') ? 'yellow' : '#fff';
//         $('#tipo-atendimento').css('color', color);
//     }, 3000);
// }

// function reason(queixas) {
//     $('#row-queixa').removeClass('hide');
//     $('#queixa').addClass('animate bounceInRight');
//     $('#queixa_value').html(queixas);
//     $('#queixa_value').addClass('animate bounceInRight');
// }

// function periodReason(periodo) {

//     $('#queixa_tempo_holder').removeClass('hide');
//     $('#queixa_tempo').html(periodo);
//     $('#queixa_tempo').addClass('animate bounceInRight');
// }

// function newEvent(event) {
//     // Only check for a return/enter press - Event 13
//     if (event.which === 13 || event.keyCode === 13) {
//         var userInput = document.getElementById('chatInput');
//         text = userInput.value; // Using text as a recurring variable through functions
//         text = text.replace(/(\r\n|\n|\r)/gm, ""); // Remove erroneous characters
//         // If there is any input then check if this is a claim step
//         // Some claim steps are handled in newEvent and others are handled in userMessage
//         if (text) {
//             // Display the user's text in the chat box and null out input box
//             //            userMessage(text);
//             displayMessage(text, 'user');
//             userInput.value = '';
//             userMessage(text);
//         } else {
//             // Blank user message. Do nothing.
//             console.error("No message.");
//             userInput.value = '';
//             return false;
//         }
//     }
// }

// function displayMessage(text, user) {
//     var chat_body = document.getElementById('chat-body');
//     var bubble = document.createElement('div');
//     bubble.setAttribute("class", "bubble");
//     if (user == "user") {
//         bubble.className += " user";
//     } else {
//         bubble.className += " watson";
//     }
//     bubble.innerHTML = text;
//     chat_body.appendChild(bubble);
//     chat_body.scrollTop = chat_body.scrollHeight;
// }

// function displayMaps(watson) {
//     var chat_body = document.getElementById('chat-body');
//     var bubble = document.createElement('div');
//     bubble.innerHTML += '<iframe width = "350px" height = "170px" frameborder = "0" style="border:0;" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCzFkRQ3y5QUWILwMttySU7MFGS-mWakOw&q=UFABC&zoom=12" allowfullscreen></iframe>';
//     chat_body.appendChild(bubble);
//     chat_body.scrollTop = chat_body.scrollHeight; // Move chat down to the last message displayed
//     document.getElementById('chatInput').focus();
// }


// userMessage('');



// function getInfo(element) {

//     document.getElementById('proximo-nome').innerHTML = element.firstChild.innerHTML.split('-')[0];
//     document.getElementById('proximo-sus').value = element.firstChild.getAttribute('data-sus');
// }

// function iniciarAtendimento() {
//     var sus = document.getElementById('proximo-sus').value;
//     context = (context === undefined) ? {} : context;
//     xhrGet('/getPatient?sus=' + sus, function (data) {
//         context['patient'] = data;
//         context['init_triagem'] = true;
//         context['sus_valid'] = true;
//         userMessage('test');
//         $('.collapsible').collapsible('open', 0);
//         $('#espera').removeClass('bounceInUp');
//         $('#espera').addClass('fadeOutLeft');
//         // $('#row-espera').addClass('hide');
//         pacienteAtendido();

//     }, function (err) {


//         context['init_triagem'] = false;
//         context['sus_valid'] = false;
//         userMessage('test-error');
//         $('.collapsible').collapsible('open', 0);
//     })
// }


// var local_list = [];
// var waiting_list = [];

// function receberLista() {
//     xhrGet('https://min-saude-apis.mybluemix.net/getWaiting', function (data) {

//         var patients = data['patients'];
//         waiting_list = getWaitingList(patients, local_list);


//         if (waiting_list.length > 0) {
//             var i = 1;
//             for (var patient of waiting_list) {

//                 $('#lista-espera').append('<a href="#modal' + i + '" onclick="getInfo(this)"><div class="waiting_item" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') + '</div></a>');
//                 $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
//                 i++;
//             }

//             waiting_list = [];
//         }
//         local_list = patients;

//         console.log(JSON.stringify(data));
//     }, function (error) {

//     });

//     setTimeout(function () {
//         receberLista();
//     }, 10000);

// }

// function pacienteAtendido() {
//     var first = local_list.shift();
//     document.getElementById('sus_' + first.sus_number).parentElement.remove();
//     xhrGet('https://min-saude-login.mybluemix.net/checkIn?susNumber=' + first.sus_number, function (data) {

//     }, function (err) {
//         console.log(err);
//     });
// }

// receberLista();


// function getWaitingList(patients, local_list) {
//     waiting_list = [];
//     for (var i = local_list.length; i < patients.length; i++) {
//         waiting_list.push(patients[i]);
//     }
//     return waiting_list;
// }