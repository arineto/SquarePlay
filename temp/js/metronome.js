var play;
var counter = 0;
function startMetronome(){
	var beep1 = document.getElementById('beep1');
	var bpm = document.getElementById('bpm').value;
	var wait_time = 60000/bpm;
	play = setInterval(function () {play_beep(beep1);}, wait_time);
}
function stopMetronome(){
	clearInterval(play);
}
function play_beep(beep1){
	beep1.play();
}