$(document).ready(function () {
    $('.modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
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

                $('#lista-medico-imediato').append('<a href="#modal1" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
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

                $('#lista-medico-prioritario').append('<a href="#modal1" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
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

                $('#lista-medico-dia').append('<a href="#modal1" onclick="getInfo(this)"><div class="waiting_item black-text" id="sus_' + patient.sus_number + '" data-sus="' + patient.sus_number + '" ">' + patient.name + ' - ' + moment(patient.arrival * 1000).format('hh:mm:ss') +
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


function startTreatment(data) {
    $('#espera-medico-imediato').addClass('animated bounceOutLeft');
    $('#espera-medico-prioritario').addClass('animated bounceOutLeft');
    $('#espera-medico-dia').addClass('animated bounceOutLeft');
    $('#loading-atendimento').removeClass('hide');
    
    setTimeout(function () {
        $('#row-historico').removeClass('hide');
        $('#row-historico').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
        $('#nome').val(data.patient.nome);
        $('#final_name').val(data.patient.nome);
        $('#receita_name').val(data.patient.nome);
        $('#sus').val(data.patient.sus);
        $('#final_sus').val(data.patient.sus);
        $('#receita_sus').val(data.patient.sus);
        $('#idade').val(data.patient.idade);
        $('#genero').val(data.patient.sexo);
        $('#situacao').val(data.patient.situacao);
        $('#historico').addClass('animated bounceInUp');
    }, 1000);
    //
    var history = data.patient.historico[data.patient.historico.length-1];
    setTimeout(function () {
        if(history['gravida'] != null ) {
            $('#grav').removeClass('hide');
            $('#gravida').val(history.gravida); }

        $('#temperatura').val(history.temperatura);
        $('#cardiaca').val(history.freq_card);
        $('#respiratoria').val(history.freq_resp);
        $('#pressao').val(history.pressaoN + ' / ' + history.pressaoD);
        $('#glicemia').val(history.glicemia);
        $('#saturacao').val(history.o2);
        $('#dor_peito').val((history.dor == true)?"Sim":"Não");
        if(history['tabagista'] != null) {
            $('#tabagista').val(history['tabagista']);
            $('#tabag').removeClass('hide');
        }
        if(history['diabetes'] != null){
            $('#diabetes').val(history['diabetes']);
            $('#diabe').removeClass('hide');
        }
        if(history['programa'] != null){
            $('#prog-tabagista').val((history['programa'] == true)?"Sim":"Não");
            $('#prog-tabag').removeClass('hide');
        }
        $('#row-triagem').removeClass('hide');
        $('#triagem').addClass('animated bounceInUp');
    }, 2000);

    setTimeout(function () {
        
        $('#queixa_value').val(history.queixa);
        document.getElementById('queixa_tempo').innerHTML = history.tempo;
        $('#row-queixa').removeClass('hide');
        $('#queixa').addClass('animated bounceInUp');
    }, 2500);

    setTimeout(function () {
        $('#row-pre-diagnostico').removeClass('hide');
        $('#pre-diag').addClass('animated bounceInUp');
    }, 3500);

    if(history.descricao != null){
        setTimeout(function(){
            document.getElementById('descricao-value').innerHTML = history.descricao;

            // if(history.pre_analise){
            
            // $('#div-pre-analise').removeClass('hide');
            // document.getElementById('pre-analise-value').innerHTML = history.pre_analise;
            // }else{
            //     document.getElementById('div-descricao').className = document.getElementById('div-descricao').className.replace(/m6/g,',12') ;
            // }
            $('#row-pre-analise').removeClass('hide');
            $('#pre-analise').addClass('animated bounceInUp');
        },4000);
       
    }
    // setTimeout(function () {
    //     $('#graph').removeClass('hide');

    //     function drawLine() {
    //         var ctx2 = document.getElementById('lineChart').getContext('2d');

    //         var myChart = new Chart(ctx2, {
    //             type: 'horizontalBar',
    //             data: {
    //                 labels: ['Dengue', 'Zika'],
    //                 datasets: [{
    //                     label: 'Doenças',
    //                     data: [40, 30, 20, 0, 100],
    //                     borderWidth: 0,
    //                     backgroundColor: ['red', 'green', 'blue']
    //                 }]
    //             },
    //             options: Chart.defaults.global
    //             // options: {
    //             //     showLines : true,
    //             //     spanGaps : false,
    //             //     responsive: true
    //             // }
    //         });
    //     }
    //     drawLine();
    // }, 4000);
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

    $('#receitar').click(function(){
        
        
        var sus = document.getElementById('sus').value;
        prescribe(sus);
        
        var receita = document.getElementById('prescricao_value').value;
        
        setTimeout(function(){
            $('#row-pre-analise').addClass('hide');
            $('#row-queixa').addClass('hide');
            $('#queixa').addClass('animated bounceInUp');
            $('#row-historico').addClass('hide');
            $('#historico').addClass('animated bounceInUp');
            $('#row-triagem').addClass('hide');
            $('#triagem').addClass('animated bounceInUp');
            $('#row-receita').addClass('hide');
            $('#receita').addClass('animated bounceInUp');
            $('#row-queixa').addClass('hide');
            $('#queixa').addClass('animated bounceInUp');
            $('#remedios_value').val(receita);
            $('#row-final').removeClass('hide');
            $('#final').addClass('animated bounceInUp');
        },2000);
    });

    $('#dismiss-final').click(function(){
        window.location.href = '/doutor';
    });
}

function saveConclusao(element){
    
}

function setTreatment() {
    
    document.getElementById('conclusao_value').value = document.getElementById('conclusao').value;
    $('#row-resumo').addClass('hide');
    $('#pre-receita').addClass('animated bounceOutRight');
    $('#row-receita').removeClass('hide');
    $('#receita').addClass('animated bounceInRight');

    

    
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



function getIndividual(){
    var sus = document.getElementById('proximo-sus').value;
    xhrGet('https://min-saude-apis.mybluemix.net/getPatient?susNumber='+sus, function(data){
        startTreatment(data);
        
    },function(err){
        // alert(err);
    });
}



function prescribe(sus_number){
    xhrGet('https://min-saude-apis.mybluemix.net/removeDoctorList?susNumber='+sus_number, function(data){
        
    },function(err){

    })
}


function imprimirConsulta(){
    window.print();
}



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