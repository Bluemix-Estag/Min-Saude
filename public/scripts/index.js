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
        $('#chatbox-header').removeClass('pulse');
    }, 20000);
    $('#chatbox').click(function () {
        $('#chatbox-header').removeClass('pulse');
    });
    $('#dismiss-historico').click(function () {
        $('#historico').addClass('animated bounceOutDown');
        // $('#row-historico').html('');
    })
    $('#dismiss-triagem').click(function () {
        // $('#row-info').html('');
        $('#triagem').addClass('animated bounceOutDown');
    })
    $('#dismiss-atendimento').click(function () {
        // $('#row-info').html('');
        $('#atendimento').addClass('animated bounceOutDown');
    })

    // setTimeout(function(){
    //     $('#row-historico').removeClass('hide');

    //     $('#historico').addClass('animated bounceInUp');
    // },5000);

    // setTimeout(function(){
    //     $('#row-info').removeClass('hide');

    //     $('#info').addClass('animated bounceInUp');
    // },10000);

    // setTimeout(function(){
    //     $('#temp').removeClass('hide');
    //     $('#temp').addClass('animated bounceInRight');
    // },15000);

    // setTimeout(function(){
    //     $('#press').removeClass('hide');
    // },20000);

    // setTimeout(function(){
    //     $('#co2').removeClass('hide');
    // },25000);

    // setTimeout(function(){
    //     $('#glicemia').removeClass('hide');
    // },25000);

    // setTimeout(function(){
    //     $('#dor-peito').removeClass('hide');
    // },25000);


    setTimeout(function(){
        $('#row-consulta').removeClass('hide');
    },3000);
    setTimeout(function(){
        $('#horario').removeClass('hide');
    },5000);

    setTimeout(function(){
        $('#local').removeClass('hide');
    },7000);

    // so pra mockar os valores mentiraa meuuu oo pode abrir audio ? 

    // $("#row-historico").click(function () {
    //     $('#row-historico').addClass('animated bounce');
    // });

});