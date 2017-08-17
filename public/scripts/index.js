function welcomeAnimation() {
    setTimeout(function () {
        var leftDiv = document.getElementById('leftSide');
        var rightDiv = document.getElementById('rightSide');
        var gifHolder = document.getElementById('welcomeGifHolder');
        gifHolder.className += ' animated zoomOut';
        setTimeout(function () {
            gifHolder.remove();
            leftDiv.className = 'animated slideOutLeft';
            rightDiv.className = 'animated slideOutRight';
        }, 500);
    }, 1500);
}
// welcomeAnimation();



// document.getElementById('chatbox').style.bottom = document.getElementById('footer').offsetHeight + 'px';

$(document).ready(function () {
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
        $('#atendimento').addClass('animated bounceOutDown');
        $('#row-espera').removeClass('hide');
        

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

