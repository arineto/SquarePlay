$( document ).ready(function() {
	var strings = ['e', 'a', 'd', 'g', 'b', 'e-'];
	var i = 0;
	for(var c=0; c<strings.length; c++){
		var q = i + 25;
		for (; i < q; i++) {
	    	$('#board').append("<div id=square"+i+" position='"+i+"' class='squareCell' control='empty' sound='"+strings[c]+(i%25)+"'></div>");
	    	$('body').append("<audio class='' id='"+strings[c]+(i%25)+"' controls> <source src='./audio/"+strings[c]+(i%25)+".mp3' type='audio/mpeg'> </audio></br>");
		}
		$('body').append("</br>");
	}
});

var position = 0;

function onMetronomeTick(t){
	if(t == 1){
		var startSquare = $('.start');
		position = parseInt(startSquare.attr('position'));
		$(".red").each(function (index) {
			$(this).removeClass('red');
		});
	}
	if(position >0){
		$('#square'+(position-1)).removeClass("red");
	}

	$('#square'+position).addClass("red");
	var sound_id = $('#square'+position).attr('sound');
	console.log(sound_id);
	document.getElementById(sound_id).play();

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
		$('.squareCell.start').removeClass("start");

		if(square.attr('control') !== 'empty'){
			square.toggleClass('start');
		}
	}
	square.removeClass();
	square.addClass('squareCell');
	square.attr('control', 'empty');
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