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
    }, 10000);
    $('#chatbox').click(function(){
        $('#chatbox-header').removeClass('pulse');
    })
});