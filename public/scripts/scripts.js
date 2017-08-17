$( document ).ready(function(){
    
    
     setTimeout(function () {
        $('#chatbox').removeClass('bounce');
        $('#chatbox').removeClass('infinite');
    }, 2000); //2 segundos para fazer a animacao duas vezes
    $('#chatbox').click(function () {
        $('#chatbox').removeClass('infinite');
        $('#chatbox').removeClass('bounce');
    });


    $('#dismiss-historico').click(function () {
        $('#historico').addClass('animated bounceOutDown');
    })
    $('#dismiss-triagem').click(function () {
        // $('#row-info').html('');
        $('#triagem').addClass('animated bounceOutDown');
    })
    $('#dismiss-atendimento').click(function () {
        // $('#row-info').html('');
        $('#row-espera').removeClass('hide');
        $('#atendimento').addClass('animated bounceOutDown');
        
        setTimeout(function(){
            window.location.href = '/acolhimento';
        },5000);
    })

    $('#dismiss-queixa').click(function (){
        $('#queixa').addClass('animated bounceOutDown');
        $('#row-queixa').removeClass('hide');
    })

    $('#dismiss-consulta').click(function () {
        // $('#row-info').html('');
        $('#consulta').addClass('animated bounceOutDown');
    })
     $('.collapsible').collapsible();
      $('.modal').modal();



});