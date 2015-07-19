$( document ).ready(function() {
	var strings = ['e', 'a', 'd', 'g', 'b', 'e-'];
	var i = 0;
	for(var c=0; c<strings.length; c++){
		var q = i + 25;
		for (; i < q; i++) {
	    	$('#board').append("<div id=square"+i+" position='"+i+"' class='squareCell' control='empty' sound='"+strings[c]+(i%25)+"'></div>");
	    	$('body').append("<audio class='xupa' id='"+strings[c]+(i%25)+"' controls> <source src='./audio/"+strings[c]+(i%25)+".mp3' type='audio/mpeg'> </audio></br>");
		}
		$('body').append("</br>");

	}
});

var controlsPositions = []; //Dictionary containing every controller on the board
var ticksQueue = [];
var leftBounds  = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
var rightBounds = [19, 39, 59, 79, 99, 119, 139, 159, 179, 199, 219, 239, 259, 279];
var topBounds   = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
var botBounds   = [260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279];

function onMetronomeTick(t){
	//If first tick, remove all marked squares
	

	if(t == 1){
		var startSquare = $('.start');
		position = parseInt(startSquare.attr('position'));
		$(".red").each(function (index) {
			$(this).removeClass('red');
		});
		
		
		//As this is the first tick and we know it comes from the start, add all spreaded ticks to the ticksQueue
		ticksQueue = playTuneAndSpreadAt(position);
		//$('#square'+position).addClass("red");
	}
	

	if(t > 1){
		/**For each tick in the queue we need to check:
		1 - Is it a valid movement to make?
		2 - Is there a controller in that position?
		*/
		var nextTickPositions = [];
		for (var i = 0; i < ticksQueue.length; i++) {
			var currentTick = ticksQueue[i];
			if(canWalk(currentTick[0], currentTick[1])){
				//Valid movement, check if it has a controller there
				$('#square'+currentTick[1]).addClass("red");
				

				var newPositions = playTuneAndSpreadAt(currentTick[1]);

				if(newPositions == undefined){
					//No controller on given position, 
					//Get new tickPosition based on the prevPosition and CurrentPosition
					//Put this newPosition on the array that will be pushed to the queue
					nextTickPositions.push(getNewPosition(currentTick[0], currentTick[1]));	
				}else{
					//Controller on given position: get it's positions and add them to tick queue
					nextTickPositions.push.apply(nextTickPositions, newPositions);
				}

			}
			$('#square'+currentTick[0]).removeClass("red");
		};

		ticksQueue = nextTickPositions;
	}

	position++;
}

function playTuneAndSpreadAt(position){
	var controller = (controlsPositions[position]);
	var newPositions = [];
	if(controller != undefined){
		var control = controller[0];
		var positions = (controlsPositions[position])[1];
		playTuneAt(position);
		console.log("play tune at:" + position + " type: " + control);

		// we need to return the previous position for every new red position
		//New Positions[n] = [prevPos, nextPos]
		positions.forEach(function(elem){
			newPositions.push([position, elem]);
		});

		return newPositions;
	}

	return undefined;
}


function playTuneAt(position){
	$('#square'+position).addClass("red");
	var sound_id = $('#square'+position).attr('sound');
	var audio = document.getElementById(sound_id);
	var segmentEnd;

	audio.addEventListener('timeupdate', function (){
	    if (segmentEnd && audio.currentTime >= segmentEnd) {
	        audio.pause();
	    }   
	    console.log(audio.currentTime);
	}, false);

	segmentEnd = 0.2;
    audio.currentTime = 0;
    audio.play();
}

function  getNewPosition (previousPosition, currentPosition) {
	// 14 15 16 17 18
	// 34 35 36 37 38    prevPos = 56, nextPos = 35
	// 54 55 56 57 58    newPos = 35 + (35 -56 ) = 35 - 21 = 14
	// 74 75 76 77 78
	// 94 95 96 97 98

	//Return [prevPos, nextPos] format
	var newPost = [currentPosition, currentPosition + (currentPosition-previousPosition)];
	return newPost;
}

function canWalk(prevPosition, nextPosition){
	var isValidMovemet = true;
	if(nextPosition < 0){
		return false;
	}
	//Check for horizontalBounds:
	//Check para esquerda:
	if($.inArray(prevPosition, leftBounds) != -1){
		if(nextPosition == prevPosition-1){
			
			return false;	// andou pra esquerda
		}

		if(nextPosition == prevPosition + 19){
			return false; //Diagonal pra esquerda baixo
		} 

		if(nextPosition == prevPosition - 21){
			return false; //Diagonal pra esquerda cima
		} 
	}

	//Check direita
	if($.inArray(prevPosition, rightBounds) != -1){
		if(nextPosition == prevPosition+1){
			
			return false;	// andou pra direita
		}

		if(nextPosition == prevPosition + 21){
			return false; //Diagonal pra direita baixo
		} 

		if(nextPosition == prevPosition - 19){
			return false; //Diagonal pra direita cima
		} 
	}

	//Check cima
	if($.inArray(prevPosition, topBounds) != -1){
		if(nextPosition == prevPosition-20){
			return false;	// andou pra cima
		}
		if(nextPosition == prevPosition-21){
			return false;	// andou pra cima esquerda
		}
		if(nextPosition == prevPosition-19){
			return false;	// andou pra cima direita
		}
	}

	//Check baixo
	if($.inArray(prevPosition, botBounds) != -1){
		if(nextPosition == prevPosition+20){
			return false;	// andou pra baixo
		}
		if(nextPosition == prevPosition+21){
			return false;	// andou pra baixo direita
		}
		if(nextPosition == prevPosition+19){
			return false;	// andou pra baixo esquerda
		}
	}

	return isValidMovemet;
}

function selectControl(control){
	$('.control_selected').removeClass("control_selected");
	control.addClass("control_selected");
}

function selectSquare(square){
	var control = $('.control_selected');

	if(control.attr("class") == undefined){
		//Removing class if you click on the square without a controller selected
		square.removeClass();
		square.addClass('squareCell');
		square.attr('control', 'empty');
		delete controlsPositions[square.attr("position")]; //Remove the controller on that position
	}else{
		//Deselect the control on controls bar
		$('.control_selected').removeClass("control_selected");
		
		if(control.attr('id') == 'start'){
			//If the control is start, remove the start stats from other cells
			$('.squareCell.start').removeClass("start");

			//Adding the class start requires having a control
			if(square.attr('control') !== 'empty'){
				//Do not duplicate the class
				if(!square.hasClass("start")){
					square.addClass(control.attr('id'));
				}
			}
		//For every other control type than start
		}else{
			var hadStart = square.hasClass("start");
			//Reset the cell and readd the default classes/controls to change the current control to another
			 square.removeClass();
			 square.addClass('squareCell');
			 square.attr('control', 'empty');
			//Add new control and class
			square.addClass(control.attr('id'));
			square.attr('control', control.attr('id'));
			if(hadStart){
				square.addClass("start");
			}

			//Creating tick positions based on the controller's type
			var controlType = control.attr('id');
			var positions = [];
			var squarePos = parseInt(square.attr('position'));

			//Orientation: North clockwise
			switch(controlType){
				case "up":
					positions[0] = squarePos-20;//Position above square
					break;
				case "down":
					positions[0] = squarePos+20;//Position below square
					break;
				case "right":
					positions[0] = squarePos+1;//Position right
					break;
				case "left":
					positions[0] = squarePos-1;//Position left
					break;
				case "northeast":
					positions[0] = squarePos-19;//Position northeast
					break;
				case "northwest":
					positions[0] = squarePos-21;//Position northwest
					break;
				case "southeast":
					positions[0] = squarePos+21;//Position southeast
					break;
				case "southwest":
					positions[0] = squarePos+19;//Position southwest
					break;
				case "broadcastAll":
					positions[0] = squarePos-20;//Position north
					positions[1] = squarePos-19;//Position northeast
					positions[2] = squarePos+1;//Position right
					positions[3] = squarePos+21;//Position southeast
					positions[4] = squarePos+20;//Position below square
					positions[5] = squarePos+19;//Position southwest
					positions[6] = squarePos-1;//Position left
					positions[7] = squarePos-21;//Position northwest

					break;
				case "broadcastSides":
					positions[0] = squarePos-20;//Position north
					positions[1] = squarePos+1;//Position right
					positions[2] = squarePos+20;//Position below
					positions[3] = squarePos-1;//Position left
					break;
				case "broadcastDiag":
					positions[0] = squarePos-19;//Position northeast
					positions[1] = squarePos+21;//Position southeast
					positions[2] = squarePos+19;//Position southwest
					positions[3] = squarePos-21;//Position northwest
					break;
				case "stop":
					positions[0] = -100
					break;
				}

			//Add this controller to the dictionary:
			//controller ID(square position) -> type, arrayOfPositions
	 		var controller = [control.attr('id'), positions];
	 		controlsPositions[square.attr("position")] = controller;
		}
	}
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






