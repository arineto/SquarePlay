$( document ).ready(function() {
	var strings = ['e', 'a', 'd', 'g', 'b', 'e-'];
	var i = 0;
	for(var c=0; c<strings.length; c++){
		var q = i + 25;
		for (; i < q; i++) {
	    	$('#board').append("<div id=square"+i+" position='"+i+"' class='squareCell' control='empty' delay = 0 sound='"+strings[c]+(i%25)+"' soundOrigin='"+strings[c]+(i%25)+"'></div>");
	    	$('body').append("<audio class='audioCell' id='"+strings[c]+(i%25)+"' controls> <source src='./audio/"+strings[c]+(i%25)+".mp3' type='audio/mpeg'> </audio></br>");
		}
		$('body').append("</br>");
	}
});

var controlsPositions = []; //Dictionary containing every controller on the board
var ticksQueue = [];
// var leftBounds  = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
// var rightBounds = [19, 39, 59, 79, 99, 119, 139, 159, 179, 199, 219, 239, 259, 279];
// var topBounds   = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
// var botBounds   = [260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279];

var leftBounds  = [0, 25, 50, 75, 100, 125];
var rightBounds = [24, 49, 74, 99, 124, 149];
var topBounds   = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
var botBounds   = [125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149];

function onMetronomeTick(t){
	//If first tick, remove all marked squares
	

	if(t == 1){
		restartDelays();
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

function restartDelays(){
	$(".squareCell").each(function (index) {
		var delay = parseInt($(this).attr("startDelay"));
		if(delay){
			$(this).attr("delay", delay);
		}
	});
}

function resetDelay(position){
	var square = $('#square'+position);
	var delay = parseInt(square.attr("startDelay"));
	if(delay){
		square.attr("delay", delay);
	}
}

function playTuneAndSpreadAt(position){
	var controller = (controlsPositions[position]);
	var newPositions = [];
	if(controller != undefined){
		var control = controller[0];
		var positions = (controlsPositions[position])[1];
		var square = $('#square'+position);
		var hasDelay = false;
		if(square.attr("delay") != 0){
			hasDelay = true;
		}

		if(!square.hasClass("mute")){
			if(!hasDelay){
				playTuneAt(position);
				resetDelay(position);
			}
		}else{
			if(!hasDelay){
				resetDelay(position);
			}
		}

		// we need to return the previous position for every new red position
		//New Positions[n] = [prevPos, nextPos]
		positions.forEach(function(elem){
			if(!hasDelay){
				newPositions.push([position, elem]);	
			}
		});

		if(hasDelay){
			newPositions.push([position, position]);
			square.attr("delay", parseInt(square.attr("delay"))-1);
		}

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

		if(nextPosition == prevPosition + 24){
			return false; //Diagonal pra esquerda baixo
		} 

		if(nextPosition == prevPosition - 26){
			return false; //Diagonal pra esquerda cima
		} 
	}

	//Check direita
	if($.inArray(prevPosition, rightBounds) != -1){
		if(nextPosition == prevPosition+1){
			
			return false;	// andou pra direita
		}

		if(nextPosition == prevPosition + 26){
			return false; //Diagonal pra direita baixo
		} 

		if(nextPosition == prevPosition - 24){
			return false; //Diagonal pra direita cima
		} 
	}

	//Check cima
	if($.inArray(prevPosition, topBounds) != -1){
		if(nextPosition == prevPosition-25){
			return false;	// andou pra cima
		}
		if(nextPosition == prevPosition-26){
			return false;	// andou pra cima esquerda
		}
		if(nextPosition == prevPosition-24){
			return false;	// andou pra cima direita
		}
	}

	//Check baixo
	if($.inArray(prevPosition, botBounds) != -1){
		if(nextPosition == prevPosition+25){
			return false;	// andou pra baixo
		}
		if(nextPosition == prevPosition+26){
			return false;	// andou pra baixo direita
		}
		if(nextPosition == prevPosition+24){
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
		}else if(control.attr('id') == 'mute'){

			//Adding the class mute requires having a control
			if(square.attr('control') !== 'empty'){
				//Do not duplicate the class
				if(!square.hasClass("mute")){
					square.addClass(control.attr('id'));
				}
			}
		}else if(control.attr('id') == 'delay'){

			//Adding the class mute requires having a control
			if(square.attr('control') !== 'empty'){
				var delayAmmount = prompt("Enter the amount of delay in ticks", "0");
				if (delayAmmount != null) {
				    var delay = parseInt(delayAmmount);
				    square.attr("delay", delay);
				    square.attr("startDelay", delay);
				}
			}
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
					positions[0] = squarePos-25;//Position above square
					break;
				case "down":
					positions[0] = squarePos+25;//Position below square
					break;
				case "right":
					positions[0] = squarePos+1;//Position right
					break;
				case "left":
					positions[0] = squarePos-1;//Position left
					break;
				case "northeast":
					positions[0] = squarePos-24;//Position northeast
					break;
				case "northwest":
					positions[0] = squarePos-26;//Position northwest
					break;
				case "southeast":
					positions[0] = squarePos+26;//Position southeast
					break;
				case "southwest":
					positions[0] = squarePos+24;//Position southwest
					break;
				case "broadcastAll":
					positions[0] = squarePos-25;//Position north
					positions[1] = squarePos-24;//Position northeast
					positions[2] = squarePos+1;//Position right
					positions[3] = squarePos+26;//Position southeast
					positions[4] = squarePos+25;//Position below square
					positions[5] = squarePos+24;//Position southwest
					positions[6] = squarePos-1;//Position left
					positions[7] = squarePos-26;//Position northwest

					break;
				case "broadcastSides":
					positions[0] = squarePos-25;//Position north
					positions[1] = squarePos+1;//Position right
					positions[2] = squarePos+25;//Position below
					positions[3] = squarePos-1;//Position left
					break;
				case "broadcastDiag":
					positions[0] = squarePos-24;//Position northeast
					positions[1] = squarePos+26;//Position southeast
					positions[2] = squarePos+24;//Position southwest
					positions[3] = squarePos-26;//Position northwest
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

function openSweetChild(){
	$("#board").replaceWith('<div id="board"><div id="square0" position="0" class="squareCell" control="empty" delay="0" sound="e0"></div><div id="square1" position="1" class="squareCell" control="empty" delay="0" sound="e1"></div><div id="square2" position="2" class="squareCell" control="empty" delay="0" sound="e2"></div><div id="square3" position="3" class="squareCell" control="empty" delay="0" sound="e3"></div><div id="square4" position="4" class="squareCell" control="empty" delay="0" sound="e4"></div><div id="square5" position="5" class="squareCell" control="empty" delay="0" sound="e5"></div><div id="square6" position="6" class="squareCell" control="empty" delay="0" sound="e6"></div><div id="square7" position="7" class="squareCell" control="empty" delay="0" sound="e7"></div><div id="square8" position="8" class="squareCell" control="empty" delay="0" sound="e8"></div><div id="square9" position="9" class="squareCell" control="empty" delay="0" sound="e9"></div><div id="square10" position="10" class="squareCell" control="empty" delay="0" sound="e10"></div><div id="square11" position="11" class="squareCell" control="empty" delay="0" sound="e11"></div><div id="square12" position="12" class="squareCell" control="empty" delay="0" sound="e12"></div><div id="square13" position="13" class="squareCell" control="empty" delay="0" sound="e13"></div><div id="square14" position="14" class="squareCell" control="empty" delay="0" sound="e14"></div><div id="square15" position="15" class="squareCell" control="empty" delay="0" sound="e15"></div><div id="square16" position="16" class="squareCell" control="empty" delay="0" sound="e16"></div><div id="square17" position="17" class="squareCell" control="empty" delay="0" sound="e17"></div><div id="square18" position="18" class="squareCell" control="empty" delay="0" sound="e18"></div><div id="square19" position="19" class="squareCell" control="empty" delay="0" sound="e19"></div><div id="square20" position="20" class="squareCell" control="empty" delay="0" sound="e20"></div><div id="square21" position="21" class="squareCell" control="empty" delay="0" sound="e21"></div><div id="square22" position="22" class="squareCell" control="empty" delay="0" sound="e22"></div><div id="square23" position="23" class="squareCell" control="empty" delay="0" sound="e23"></div><div id="square24" position="24" class="squareCell" control="empty" delay="0" sound="e24"></div><div id="square25" position="25" class="squareCell" control="empty" delay="0" sound="a0"></div><div id="square26" position="26" class="squareCell" control="empty" delay="0" sound="a1"></div><div id="square27" position="27" class="squareCell" control="empty" delay="0" sound="a2"></div><div id="square28" position="28" class="squareCell" control="empty" delay="0" sound="a3"></div><div id="square29" position="29" class="squareCell" control="empty" delay="0" sound="a4"></div><div id="square30" position="30" class="squareCell" control="empty" delay="0" sound="a5"></div><div id="square31" position="31" class="squareCell" control="empty" delay="0" sound="a6"></div><div id="square32" position="32" class="squareCell" control="empty" delay="0" sound="a7"></div><div id="square33" position="33" class="squareCell" control="empty" delay="0" sound="a8"></div><div id="square34" position="34" class="squareCell" control="empty" delay="0" sound="a9"></div><div id="square35" position="35" class="squareCell" control="empty" delay="0" sound="a10"></div><div id="square36" position="36" class="squareCell" control="empty" delay="0" sound="a11"></div><div id="square37" position="37" class="squareCell" control="empty" delay="0" sound="a12"></div><div id="square38" position="38" class="squareCell" control="empty" delay="0" sound="a13"></div><div id="square39" position="39" class="squareCell" control="empty" delay="0" sound="a14"></div><div id="square40" position="40" class="squareCell" control="empty" delay="0" sound="a15"></div><div id="square41" position="41" class="squareCell southwest" control="southwest" delay="0" sound="a16"></div><div id="square42" position="42" class="squareCell" control="empty" delay="0" sound="a17"></div><div id="square43" position="43" class="squareCell" control="empty" delay="0" sound="a18"></div><div id="square44" position="44" class="squareCell" control="empty" delay="0" sound="a19"></div><div id="square45" position="45" class="squareCell" control="empty" delay="0" sound="a20"></div><div id="square46" position="46" class="squareCell" control="empty" delay="0" sound="a21"></div><div id="square47" position="47" class="squareCell" control="empty" delay="0" sound="a22"></div><div id="square48" position="48" class="squareCell left" control="left" delay="0" sound="a23"></div><div id="square49" position="49" class="squareCell" control="empty" delay="0" sound="a24"></div><div id="square50" position="50" class="squareCell" control="empty" delay="0" sound="d0"></div><div id="square51" position="51" class="squareCell" control="empty" delay="0" sound="d1"></div><div id="square52" position="52" class="squareCell" control="empty" delay="0" sound="d2"></div><div id="square53" position="53" class="squareCell" control="empty" delay="0" sound="d3"></div><div id="square54" position="54" class="squareCell" control="empty" delay="0" sound="d4"></div><div id="square55" position="55" class="squareCell" control="empty" delay="0" sound="d5"></div><div id="square56" position="56" class="squareCell" control="empty" delay="0" sound="d6"></div><div id="square57" position="57" class="squareCell" control="empty" delay="0" sound="d7"></div><div id="square58" position="58" class="squareCell" control="empty" delay="0" sound="d8"></div><div id="square59" position="59" class="squareCell" control="empty" delay="0" sound="d9"></div><div id="square60" position="60" class="squareCell" control="empty" delay="0" sound="d10"></div><div id="square61" position="61" class="squareCell southeast start" control="southeast" delay="0" sound="d11"></div><div id="square62" position="62" class="squareCell" control="empty" delay="0" sound="d12"></div><div id="square63" position="63" class="squareCell" control="empty" delay="0" sound="d13"></div><div id="square64" position="64" class="squareCell" control="empty" delay="0" sound="d14"></div><div id="square65" position="65" class="squareCell" control="empty" delay="0" sound="d15"></div><div id="square66" position="66" class="squareCell" control="empty" delay="0" sound="d16"></div><div id="square67" position="67" class="squareCell right mute" control="right" delay="3" sound="d17" startdelay="3"></div><div id="square68" position="68" class="squareCell down" control="down" delay="0" sound="d18"></div><div id="square69" position="69" class="squareCell" control="empty" delay="0" sound="d19"></div><div id="square70" position="70" class="squareCell right mute" control="right" delay="0" sound="d20"></div><div id="square71" position="71" class="squareCell" control="empty" delay="0" sound="d21"></div><div id="square72" position="72" class="squareCell" control="empty" delay="0" sound="d22"></div><div id="square73" position="73" class="squareCell up mute" control="up" delay="1" sound="d23" startdelay="1"></div><div id="square74" position="74" class="squareCell" control="empty" delay="0" sound="d24"></div><div id="square75" position="75" class="squareCell" control="empty" delay="0" sound="g0"></div><div id="square76" position="76" class="squareCell" control="empty" delay="0" sound="g1"></div><div id="square77" position="77" class="squareCell" control="empty" delay="0" sound="g2"></div><div id="square78" position="78" class="squareCell" control="empty" delay="0" sound="g3"></div><div id="square79" position="79" class="squareCell" control="empty" delay="0" sound="g4"></div><div id="square80" position="80" class="squareCell" control="empty" delay="0" sound="g5"></div><div id="square81" position="81" class="squareCell" control="empty" delay="0" sound="g6"></div><div id="square82" position="82" class="squareCell" control="empty" delay="0" sound="g7"></div><div id="square83" position="83" class="squareCell" control="empty" delay="0" sound="g8"></div><div id="square84" position="84" class="squareCell" control="empty" delay="0" sound="g9"></div><div id="square85" position="85" class="squareCell" control="empty" delay="0" sound="g10"></div><div id="square86" position="86" class="squareCell southeast" control="southeast" delay="5" sound="g11" startdelay="5"></div><div id="square87" position="87" class="squareCell" control="empty" delay="0" sound="g12"></div><div id="square88" position="88" class="squareCell left" control="left" delay="6" sound="g13" startdelay="6"></div><div id="square89" position="89" class="squareCell down mute" control="down" delay="4" sound="g14" startdelay="4"></div><div id="square90" position="90" class="squareCell" control="empty" delay="0" sound="g15"></div><div id="square91" position="91" class="squareCell" control="empty" delay="5" sound="g16" startdelay="5"></div><div id="square92" position="92" class="squareCell" control="empty" delay="0" sound="g17"></div><div id="square93" position="93" class="squareCell" control="empty" delay="0" sound="g18"></div><div id="square94" position="94" class="squareCell" control="empty" delay="0" sound="g19"></div><div id="square95" position="95" class="squareCell" control="empty" delay="0" sound="g20"></div><div id="square96" position="96" class="squareCell" control="empty" delay="0" sound="g21"></div><div id="square97" position="97" class="squareCell" control="empty" delay="0" sound="g22"></div><div id="square98" position="98" class="squareCell" control="empty" delay="0" sound="g23"></div><div id="square99" position="99" class="squareCell" control="empty" delay="0" sound="g24"></div><div id="square100" position="100" class="squareCell" control="empty" delay="0" sound="b0"></div><div id="square101" position="101" class="squareCell" control="empty" delay="0" sound="b1"></div><div id="square102" position="102" class="squareCell" control="empty" delay="0" sound="b2"></div><div id="square103" position="103" class="squareCell" control="empty" delay="0" sound="b3"></div><div id="square104" position="104" class="squareCell" control="empty" delay="0" sound="b4"></div><div id="square105" position="105" class="squareCell" control="empty" delay="0" sound="b5"></div><div id="square106" position="106" class="squareCell" control="empty" delay="0" sound="b6"></div><div id="square107" position="107" class="squareCell" control="empty" delay="0" sound="b7"></div><div id="square108" position="108" class="squareCell" control="empty" delay="0" sound="b8"></div><div id="square109" position="109" class="squareCell" control="empty" delay="0" sound="b9"></div><div id="square110" position="110" class="squareCell" control="empty" delay="0" sound="b10"></div><div id="square111" position="111" class="squareCell" control="empty" delay="0" sound="b11"></div><div id="square112" position="112" class="squareCell" control="empty" delay="0" sound="b12"></div><div id="square113" position="113" class="squareCell right mute" control="right" delay="0" sound="b13" startdelay="4"></div><div id="square114" position="114" class="squareCell northwest" control="northwest" delay="0" sound="b14"></div><div id="square115" position="115" class="squareCell" control="empty" delay="0" sound="b15"></div><div id="square116" position="116" class="squareCell" control="empty" delay="0" sound="b16"></div><div id="square117" position="117" class="squareCell" control="empty" delay="0" sound="b17"></div><div id="square118" position="118" class="squareCell northeast" control="northeast" delay="5" sound="b18" startdelay="5"></div><div id="square119" position="119" class="squareCell" control="empty" delay="0" sound="b19"></div><div id="square120" position="120" class="squareCell" control="empty" delay="0" sound="b20"></div><div id="square121" position="121" class="squareCell" control="empty" delay="0" sound="b21"></div><div id="square122" position="122" class="squareCell" control="empty" delay="0" sound="b22"></div><div id="square123" position="123" class="squareCell" control="empty" delay="0" sound="b23"></div><div id="square124" position="124" class="squareCell" control="empty" delay="0" sound="b24"></div><div id="square125" position="125" class="squareCell" control="empty" delay="0" sound="e-0"></div><div id="square126" position="126" class="squareCell" control="empty" delay="0" sound="e-1"></div><div id="square127" position="127" class="squareCell" control="empty" delay="0" sound="e-2"></div><div id="square128" position="128" class="squareCell" control="empty" delay="0" sound="e-3"></div><div id="square129" position="129" class="squareCell" control="empty" delay="0" sound="e-4"></div><div id="square130" position="130" class="squareCell" control="empty" delay="0" sound="e-5"></div><div id="square131" position="131" class="squareCell" control="empty" delay="0" sound="e-6"></div><div id="square132" position="132" class="squareCell" control="empty" delay="0" sound="e-7"></div><div id="square133" position="133" class="squareCell" control="empty" delay="0" sound="e-8"></div><div id="square134" position="134" class="squareCell" control="empty" delay="0" sound="e-9"></div><div id="square135" position="135" class="squareCell" control="empty" delay="0" sound="e-10"></div><div id="square136" position="136" class="squareCell" control="empty" delay="0" sound="e-11"></div><div id="square137" position="137" class="squareCell" control="empty" delay="0" sound="e-12"></div><div id="square138" position="138" class="squareCell right mute" control="right" delay="4" sound="e-13" startdelay="4"></div><div id="square139" position="139" class="squareCell northeast" control="northeast" delay="0" sound="e-14"></div><div id="square140" position="140" class="squareCell" control="empty" delay="0" sound="e-15"></div><div id="square141" position="141" class="squareCell" control="empty" delay="0" sound="e-16"></div><div id="square142" position="142" class="squareCell" control="empty" delay="0" sound="e-17"></div><div id="square143" position="143" class="squareCell" control="empty" delay="0" sound="e-18"></div><div id="square144" position="144" class="squareCell" control="empty" delay="0" sound="e-19"></div><div id="square145" position="145" class="squareCell" control="empty" delay="0" sound="e-20"></div><div id="square146" position="146" class="squareCell" control="empty" delay="0" sound="e-21"></div><div id="square147" position="147" class="squareCell" control="empty" delay="0" sound="e-22"></div><div id="square148" position="148" class="squareCell" control="empty" delay="0" sound="e-23"></div><div id="square149" position="149" class="squareCell" control="empty" delay="0" sound="e-24"></div></div>');	
}

function openDemoNotes(){

}

function openDemoEletronic(){

}

function changePitch(btnPitch){
	var pitch = parseInt(btnPitch);
	var suffix = "";
	var btnId = "";
	if(pitch == -2){
		suffix = "minus10";
		btnId = "pitch-2";
	}else if(pitch == -1){
		suffix = "minus5";
		btnId = "pitch-1";
	}else if(pitch == 0){
		suffix = "";
		btnId = "pitch0";
	}else if(pitch == 1){
		suffix = "plus5";
		btnId = "pitch1";
	}else if(pitch == 2){
		suffix = "plus10";
		btnId = "pitch2";
	}

	$(".squareCell").each(function (index) {
		var soundOrigin = $(this).attr("soundOrigin");
			$(this).attr("sound", soundOrigin+suffix);
		});

	$(".pitchSelected").removeClass("pitchSelected");
	$("#"+btnId).addClass("pitchSelected");

}


