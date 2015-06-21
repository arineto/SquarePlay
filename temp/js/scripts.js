
$( document ).ready(function() {
    for (var i = 0; i <280; i++) {
    	$('#board').append("<div id=square"+i+" class='squareCell'></div>");
	}
});

var position = 0;

function onMetronomeTick(){
	if(position >0){
		$('#square'+(position-1)).removeClass("red");
	}
	$('#square'+position).addClass("red");
	position++;
}