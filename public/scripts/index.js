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
        $('#row-historico').html('');
    })
    $('#dismiss-info').click(function () {
        $('#row-info').html('');
    })

    setTimeout(function(){
        $('#row-historico').removeClass('hide');
    },5000);

    setTimeout(function(){
        $('#row-info').removeClass('hide');
    },10000);

    setTimeout(function(){
        $('#temp').removeClass('hide');
    },15000);

    setTimeout(function(){
        $('#press').removeClass('hide');
    },20000);

    setTimeout(function(){
        $('#co2').removeClass('hide');
    },25000);

    setTimeout(function(){
        $('#glicemia').removeClass('hide');
    },25000);

    setTimeout(function(){
        $('#dor-peito').removeClass('hide');
    },25000);

    // so pra mockar os valores mentiraa meuuu oo pode abrir audio ? 

    // $("#row-historico").click(function () {
    //     $('#row-historico').addClass('animated bounce');
    // });

});