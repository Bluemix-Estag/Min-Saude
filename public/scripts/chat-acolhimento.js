var params = {},
    watson = 'Watson',
    context;



function userMessage(message) {

    params.text = message;
    if (context) {
        params.context = context;
    }
    var xhr = new XMLHttpRequest();
    var uri = '/api/watson/acolhimento';
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        // Verify if there is a success code response and some text was sent
        if (xhr.status === 200 && xhr.responseText) {
            var response = JSON.parse(xhr.responseText);
            text = response.output.text; // Only display the first response
            context = response.context; // Store the context for next round of questions
            // console.log("Got response from Ana: ", JSON.stringify(response));
            

            
            if(context['check_patient']){
                checkPatient(context['info']['SUS_number']);
                context['check_patient'] = false;
                
            
            }
            if(context['show_history']){
                showHistory(context['info']);
            }
            if(context['show_agenda'] == true){
                showAgenda(context['info']);
                context['show_agenda'] = false;
                context['acolhimento_continue'] = true;
                userMessage('');
            }
            if(context['encaminhar_triagem']){
                var new_patient = {
                    "name": context['info']['nome'],
                    "sus_number": context['info']['sus']
                }
                
                xhrPost('https://min-saude-apis.mybluemix.net/addWaiting', new_patient, function(result){
                    setTimeout(function(){
                        window.location.href = '/acolhimento';
                    },5000);
                },function(err){
                    console.log(err);
                })
            }

            // if(context('fim_triagem')){
            //     // POST com o paciente, info respostas da triagem e o tipo do atendimento
            // }


            if(context['acolhimento_close']){
                setTimeout(function(){
                    window.location.href = '/acolhimento';
                },5000);
            }
            
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


function showHistory(data) {
        $('#row-historico').removeClass('hide');
        $('#historico').addClass('animated bounceInUp');
        $('#nome').val(data.nome);
        $('#paciente-nome').val(data.nome);
        $('#sus').val(data.sus);
        $('#paciente-sus').val(data.sus);
        $('#idade').val(data.idade);
        $('#genero').val(data.sexo);
}



function showAgenda(patient){
    
    setTimeout(function(){
        $('#row-consulta').removeClass('hide');
    },1000);
    setTimeout(function(){
        $('#atividade_value').val(patient.atividades[0].atividade);
        $('#atividade').removeClass('hide');
        $('#atividade').addClass('animated bounceInRight');
    });
    setTimeout(function(){
        $('#date').val(moment(patient.atividades[0].date));
        $('#horario').removeClass('hide');
        $('#horario').addClass('animated bounceInRight');
    },2000);
    setTimeout(function(){
        
        $('#place').val(patient.atividades[0].doctor+' - '+patient.atividades[0].local);
        $('#local').removeClass('hide');
        $('#local').addClass('animated bounceInRight');

    },2500);
}

function checkPatient(sus){

    xhrGet('/getPatientAgenda?sus='+sus,function(patient){

        if(patient.atividades.length >0 ){
            context['agendado'] = true;
            context['sus_valido'] = true;
            context['info'] = patient;
            userMessage('sus_valido');
        }else{
            context['info'] = patient;
            context['sus_valido'] = true;
            context['agendado'] = false;
            userMessage('sus_valido');
        }

    },function(err){
        if(err.status == 404){ 
            context['sus_valido'] = false;
            userMessage('sus_invalido');
        }
    });
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

userMessage('');




function imprimirConsulta(){
    window.print();
}