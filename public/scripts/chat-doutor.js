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

    $('#cid').on('input', function() { 
       var original_cid =  $(this).val();
       xhrGet('/getCID?cid='+original_cid+'&doenca=Espirilose',function(data){
           if(data.same_cid == true){
               alert('Mesmo CID');
           }else{
               var question = confirm('O CID alterado é de ' + data.result + ' deseja continuar?');
               if(question == true){
                   
               }else{
                   document.getElementById('cid').value = '';
               }
           }
       },function(error){
           console.log(error);
       });
    
});

});




function fixes() {
    var main = document.getElementById('main_body').offsetHeight;
    var header = document.getElementById('nav').offsetHeight;

    document.getElementById('chat-popup').style.top = header + 'px';
    document.getElementById('chat-popup').style.height = main + 'px';
}
fixes();

var params = {},
    watson = 'Watson',
    context = {};
var patientName;
var patientSus;
var type;


function userMessage(message) {
    params.text = message;
    if (context) {
        params.context = context;
    }
    var xhr = new XMLHttpRequest();
    var uri = '/api/watson/doutor';
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        // Verify if there is a success code response and some text was sent
        if (xhr.status === 200 && xhr.responseText) {
            var response = JSON.parse(xhr.responseText);
            text = response.output.text; // Only display the first response
            context = response.context; // Store the context for next round of questions
            console.log("Got response from Ana: ", JSON.stringify(response));


            if (context['result'] != null) {
                if (context['result'] == "null") {
                    showResult(null);
                } else {
                    showResult(context['result']);
                }
                delete context['result'];
            }

            // console.log(JSON.stringify(text));
            for (var txt in text) {
                displayMessage(text[txt], watson);
            }

            if (context['result_sintomas'] != null && context['show_search_sintomas'] == true) {
                displaySearch(context['result_sintomas'], "sintomas");
                context['show_search_sintomas'] = false;
            }

            if (context['showDB'] == true && context['searchDB'] != null) {
                displaySearch(context['result_search'], "definicao");
                context['showDB'] = false;
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

function showResult(result) {
    var preescricao, cid;
    if (result == null && result['errMsg']) {
        preescricao = "Sem critério";
        cid = "Não encontrado";
    } else {
        cid = result['CID'];
        preescricao = "<h5>Medicamento:</h5><br><div style='margin-left:20px; color:red;'>-" + result['Medicamentos'].split('\n').join('<br>-') + "</div>";
        preescricao += "<h5>Exames: </h5><br><div style='margin-left:20px; color:red'>-" + result['Exames'].split('\n').join('<br>-') + "</div>";
    }
    preescricao += '<br> Retorno em ' + context['retorno'] + ' dias';

    $('#cid').val(cid);
    $('#preescricao').html(preescricao);
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


function displaySearch(result, action) {
    var text = "";
    if (result.errMsg != null) {
        displayMessage(result.errMsg, 'watson')
    } else {
        text = (action == "sintomas") ? result.sintomas : result.introducao;
        var chat_body = document.getElementById('chat-body');
        var bubble = document.createElement('div');
        bubble.setAttribute("class", "bubble");
        bubble.className += " watson";
        var id = context['search_sintomas'] || context['searchDB'];
        bubble.innerHTML = (text.length > 300) ? text.substring(0, 300) + '...<br><a href="#' + action + '_' + id + '" class="leia-mais orange-text text-lighten-5" >Leia mais</a>' : text;
        if (text.length > 300) {
            var content = (result.introducao != null && result.introducao != 'Não encontrado') ? '<h4>Introdução</h4><div style="margin-left:20px">' + result.introducao + '</div>' : '';
            content += (result.sintomas != null) ? '<h4>Sintomas</h4><div style="margin-left:20px;">' + result.sintomas + '</div>' : '';;
            addModal(content, action + '_' + id);
        }
        chat_body.appendChild(bubble);
        chat_body.scrollTop = chat_body.scrollHeight;
    }
}

function addModal(content, id) {
    var div = document.getElementById('modals');
    var modal = '<div id="' + id + '" class="modal"><div class="modal-content">' + content + '</div><div class="modal-footer"><a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" >Ok</a></div></div>';
    div.innerHTML += modal;
    $('.modal').modal();

}



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
                    '<div class="right black-text" id="timeri' + i + '"></div>' + '</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timeri' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds, timer_id);
                total_seconds_imediato += seconds;
            }

            var tempo_medio_imediato = (total_seconds_imediato / waiting_list_imediato.length);
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
                    '<div class="right black-text" id="timerp' + i + '"></div>' + '</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timerp' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds, timer_id);
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
                    '<div class="right black-text" id="timerd' + i + '"></div>' + '</div></a>');
                $('#sus_' + patient.sus_number).addClass('animated bounceInUp');
                var timer_id = 'timerd' + i;
                i++;
                var seconds = moment.duration(moment().format('HH:mm:ss')).asSeconds() - moment.duration(moment(patient.arrival * 1000).format('HH:mm:ss')).asSeconds();
                countUp(seconds, timer_id);
            }





            document.getElementById('dia_badge').innerHTML = dia.length;
            waiting_list_dia = [];
        }
        local_dia = dia;


    }, function (error) {

    });

    setTimeout(function () {
        receberListaDoutor();
    }, 3000);

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
    context['init'] = true;
    context['patient'] = data.patient;


    setTimeout(function () {
        $('#espera_imediato_holder').addClass('hide');
        $('#espera_prioritario_holder').addClass('hide');
        $('#espera_dia_holder').addClass('hide');
        $('#espera_imediato').removeClass('animated bounceOutLeft');
        $('#espera_prioritario').removeClass('animated bounceOutLeft');
        $('#espera_dia').removeClass('animated bounceOutLeft');
        setTimeout(function () {
            $('#overlay').removeClass('hide');
            $('#overlay').addClass('animated slideInLeft');
            $('#chat-popup').removeClass('hide');
            $('#chat-popup').addClass('animateChat');
        }, 250);
        $('#loading-atendimento').removeClass('hide');
    }, 500)


    setTimeout(function () {

        $('#row-info').removeClass('hide');
        $('#historico_holder').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
        $('#exame_fisico_holder').removeClass('hide');
        $('#exame').removeClass('hide');
        $('#exame').addClass('animated bounceInUp');
        $('#queixa').removeClass('hide');
        $('#queixa').addClass('animated bounceInUp');
        $('#prescricao').removeClass('hide');
        $('#prescricao').addClass('animated bounceInUp');
        $('#diagnostico').addClass('animated bounceInUp');

        $('#triagem_holder').removeClass('hide');

        $('#nome').val(data.patient.nome);
        $('#final_name').val(data.patient.nome);
        $('#receita_name').val(data.patient.nome);
        $('#sus').val(data.patient.sus);
        $('#final_sus').val(data.patient.sus);
        $('#receita_sus').val(data.patient.sus);
        $('#idade').val(data.patient.idade);
        $('#genero').val(data.patient.sexo);
        $('#situacao').val(data.patient.situacao);
        $('#triagem').addClass('animated bounceInUp');
    }, 1000);
    //
    var history = data.patient.historico[data.patient.historico.length - 1];
    if (history != null) context['info'] = history;
    userMessage('');
    setTimeout(function () {
        if (history['gravida'] != null) {
            $('#grav').removeClass('hide');
            $('#gravida').val(history.gravida);
        }

        $('#temperatura').val(history.temperatura);
        $('#cardiaca').val(history.freq_card);
        $('#respiratoria').val(history.freq_resp);
        $('#pressao').val(history.pressaoN + ' / ' + history.pressaoD);
        $('#glicemia').val(history.glicemia);
        $('#saturacao').val(history.o2);
        $('#dor_peito').val((history.dor == true) ? "Sim" : "Não");
        if (history['tabagista'] != null) {
            $('#tabagista').val(history['tabagista']);
            $('#tabag').removeClass('hide');
        }
        if (history['diabetes'] != null) {
            $('#diabetes').val(history['diabetes']);
            $('#diabe').removeClass('hide');
        }
        if (history['programa'] != null) {
            $('#prog-tabagista').val((history['programa'] == true) ? "Sim" : "Não");
            $('#prog-tabag').removeClass('hide');
        }
        $('#row-info').removeClass('hide');
        $('#triagem').addClass('animated bounceInUp');
    }, 2000);

    // setTimeout(function () {

    $('#descricao-value').html(history.queixa);
    // document.getElementById('queixa_tempo').innerHTML = history.tempo;
    // $('#row-queixa-exame').removeClass('hide');
    // $('#queixa').addClass('animated bounceInUp');
    // }, 2500);

    setTimeout(function () {
        $('#row-pre-diagnostico').removeClass('hide');
        $('#pre-diag').addClass('animated bounceInUp');
    }, 3500);

    if (history.descricao != null) {
        setTimeout(function () {
            document.getElementById('descricao-value').innerHTML = history.descricao;

            // if(history.pre_analise){

            // $('#div-pre-analise').removeClass('hide');
            // document.getElementById('pre-analise-value').innerHTML = history.pre_analise;
            // }else{
            //     document.getElementById('div-descricao').className = document.getElementById('div-descricao').className.replace(/m6/g,',12') ;
            // }
            $('#row-pre-analise').removeClass('hide');
            $('#pre-analise').addClass('animated bounceInUp');
        }, 4000);

    }

    setTimeout(function () {
        $('#row-pre-receita').removeClass('hide');
        $('#pre-receita').addClass('animated bounceInUp');
        $('#row-resumo').removeClass('hide');
        $('#resumo').addClass('animated bounceInUp');
    }, 4250);
    setTimeout(function () {
        $('#loading-atendimento').addClass('hide');
    }, 1000);

    $('#receitar').click(function () {


        var sus = document.getElementById('sus').value;
        prescribe(sus);

        var receita = document.getElementById('prescricao_value').value;

        setTimeout(function () {
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
        }, 2000);
    });

    $('#dismiss-final').click(function () {
        window.location.href = '/doutor';
    });
}

function saveConclusao(element) {

}

function setTreatment() {

    document.getElementById('conclusao_value').value = document.getElementById('conclusao').value;
    $('#row-resumo').addClass('hide');
    $('#pre-receita').addClass('animated bounceOutRight');
    $('#row-receita').removeClass('hide');
    $('#receita').addClass('animated bounceInRight');




}



function countUp(timestamp, id) {
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



function getIndividual() {
    var sus = document.getElementById('proximo-sus').value;
    xhrGet('https://min-saude-apis.mybluemix.net/getPatient?susNumber=' + sus, function (data) {

        startTreatment(data);

    }, function (err) {
        // alert(err);
    });
}



function prescribe(sus_number) {
    xhrGet('https://min-saude-apis.mybluemix.net/removeDoctorList?susNumber=' + sus_number, function (data) {
        setTimeOut(function () {
            window.location.href = "/doutor";
        }, 500)
    }, function (err) {

    })
}


function imprimirConsulta() {
    window.print();
}


