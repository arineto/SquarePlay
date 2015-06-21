
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

function selectControl(control){
	$('.control_selected').removeClass("control_selected");
	control.addClass("control_selected");
}

function selectSquare(square){
	var control = $('.control_selected');
	$('.control_selected').removeClass("control_selected");
	if(control.attr('id') == 'start'){
		$('.start').removeClass("start");
	}
	square.removeClass();
	square.addClass('squareCell');
	square.addClass(control.attr('id'));
	square.attr('control', control.attr('id'));
}

$(document).on({
	click: function(event){
		if(event.handled !== true){
			event.handled = true;
			selectControl($(this));
		}
		return false;
	}
}, ".block");

$(document).on({
	click: function(event){
		if(event.handled !== true){
			event.handled = true;
			selectSquare($(this));
		}
		return false;
	}
}, ".squareCell");