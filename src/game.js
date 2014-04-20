
function initGame(){

	Crafty.init(650,500);
	//Crafty.canvas.init();

	Crafty.viewport.init(650,500);
	Crafty.viewport.scale(0.8);

	var logo = Crafty.e("2D, DOM, Image").image("resources/images/hexwars.png");
		logo.attr({y: 30, x: 200});

	var loadingText = Crafty.e("2D, DOM, Text").text("Loading...");
		loadingText.attr({y:200,w:800}).css({"text-align":"center", "font":"arial", "font-size":"30px"});

	Crafty.sprite(64, "resources/images/hex.png", {
        hexagon: [0, 0],
        player1: [1, 0],
        player2: [2, 0],

		selected: [0, 1],
        path: [1, 1]        
    });

    Crafty.audio.add({
    	//music: "resources/audio/Machinimasound.com_-_Afterlife_City.mp3",
    	tileFlip: [
    		"resources/audio/button-29.wav",
    		"resources/audio/button-29.mp3"
    	]
    });

    Crafty.scene("gameBoard");
    tileValue = generateTileValue();
    updatePlayersTile();

};


//Loading scene
Crafty.scene("loading", function() {
	initGame();	
});

//Options menu
Crafty.scene("options", function() {});


//Game board scene
Crafty.scene("gameBoard", function() {

	//if(playMusic==true){ Crafty.audio.play("music",-1) }
		tileValue = generateTileValue();

	hexmap.create(boardSize[0], boardSize[1], boardDensity, function() {
        return Crafty.e("2D, DOM, Mouse, Tween, Particles, hexagon, Text").bind("Click", function() {
        	
        	//Check to see if it's the players turn, else they can't make a move
        	if(playersTurn == thisPlayer){

	        	if(this.owner==0){
	        		//Only allow clicking on a tile if it hasn't already been taken
		        	claimTile(this, playersTurn, tileValue) ;
		        }

		    }

            /*if (!selected) {
                selected = this;
                this.removeComponent("hexagon").addComponent("selected");
            }
            else if (selected === this) {
                selected = null;
                this.removeComponent("selected").addComponent("hexagon");
            }*/

        }).bind("MouseOver", function() {

        	if(this.owner == 0){
        		//Only do hover effects if this tile doesn't belong to anyone

	        	if(selected){
	        		if(selected.owner == 0){
	        			selected.removeComponent("selected").addComponent("hexagon");
	        		} else {
						selected = null;	        			
	        		}
	        	}

	        	hexmap.getTile(this.i, this.j).removeComponent("hexagon").addComponent("selected");
	        	selected = this;


	        } else {
	        	//Player is hovering over taken square.. Remove hover effect
	        	if(selected){ selected.removeComponent("selected").addComponent("hexagon").addComponent("player"+selected.owner) };
	        	selected = null;
	        
	        }

        }).bind("MouseOut", function(){
        	//console.log(selected);
        	//selected.removeComponent("selected").addComponent("hexagon");
        }).css({"cursor": "default"});
        
    });

	//Score panel, etc
	Crafty.e("HTML, gameScore").attr({x:20, y:520, w:760, h:100});
		
		Crafty.e("Player1Score, 2D, DOM, Text").attr({ x: 50, y: 540, w: 400 })
			.css({"font-size" : "30px", "font-family": "arial", "color" : "#78e288"})
	    	.text(function () { return "Your score: " + playerScores[1] });

	    Crafty.e("Player2Score, 2D, DOM, Text").attr({ x: 350, y: 540, w: 400 })
			.css({"font-size" : "30px", "font-family": "arial", "color" : "#f64847", "text-align": "right"})
	    	.text(function () { return "Enemy score: " + playerScores[2] });

	    Crafty.e("PlayersTile, 2D, DOM, Text, player"+playersTurn).attr({ x: 352, y: 505, w: 64, h: 64 })
			.css({"font-size" : "40px", "font-family": "arial", "color" : "#fff", "text-align": "center", "line-height": 64})
	    	.text(function () { return "..." });

	    Crafty.e("PlayersTurnInfo, 2D, DOM, Text").attr({ x: 0, y: 575, w: 770 })
			.css({"font-size" : "22px", "font-family": "arial", "color" : "#fff", "text-align": "center"})
	    	.text(function () { return "Your Turn" });




	//loadingText.text('Loading ('+(e.percent.toFixed(0))+'%)');

});

//Options/ Instruction, Title, etc
Crafty.scene("gameStart", function () {

    Crafty.e("Player1Score, 2D, DOM, Text").attr({ x: 50, y: 540, w: 400 })
			.css({"font-size" : "30px", "font-family": "arial", "color" : "#78e288"})
	    	.text(function () { return "Your score: " });


});



//User wants to claim a tile
function claimTile(tile, player, value){
	
	switchTile(tile, player, value);		

	//Grab a list of all tiles around the selected one
	var adjacentTiles = hexmap.getAdjacentTiles(tile.i,tile.j);
		adjacentTiles.forEach(function(tile) {		
			if(tile.owner == 0){
				//This tile has no owner.. Do nothing

			} else if (tile.owner == player){
				//This tile is owned by the player -- Increase it's score (if below 20)
				//console.log("Player owned");
				if( tile.value < 20){ 
					switchTile(tile, player, tile.value+1) 
				};

			} else {
				//This tile is owned by the enemy.. Take it over if this tiles value is higher
				if(value > tile.value){
					switchTile(tile, player, tile.value)
				};
			};

		});

		//If in multiplayer, and it's THIS players turn, send the location AND value of the placed tile
		if(playersTurn==thisPlayer && gameType=="netMulti"){
			//Send X,y,value
			var tmpTilePlacementData = new Array(tile.i,tile.j,value)
			sendMessage( { "placedTile" : tmpTilePlacementData } );
		}

	//Now we've placed a tile, we should re-calculate every players score
	calculateScores();

	//We also need to check here if the board if full, and determine a winner

	playersTurn++; 
	if(playersTurn==3){ playersTurn = 1 };
	tileValue = generateTileValue();
	//console.log("Next player: " + playersTurn + ", Tile: " + tileValue);

	//Update the PlayersTile notifier
	updatePlayersTile();


};

//Generate a tile value between 1 and 20
function generateTileValue(){	
	var tmpValue = Math.floor(Math.random()*20)+1;

	//If we're in a multiplayer game, we should send this value to the other player
	if(gameType=="netMulti"){
		sendMessage( { "generatedTileValue" : tmpValue } );
	}

	return tmpValue;
}


function updatePlayersTile(){
	Crafty("PlayersTile").each(function () { 
		this.text(tileValue);
		if(playersTurn==2){
			this.removeComponent("player1");
			this.addComponent("player2");
			Crafty("PlayersTurnInfo").each(function () { 		    	
		    	this.text("Thinking...");
		    });

			//Set a fake waiting period, as the Ai scripts are too fast
		    if(gameType=="single"){
		    	setTimeout(function(){ aiTurn() },1000)
		    }
		    
		} else {
			this.removeComponent("player2");
			this.addComponent("player1");
			Crafty("PlayersTurnInfo").each(function () { 
		    	this.text("Your Turn");
		    });
		}    	
    });
}


//Loop through tiles and calculate score for both players
function calculateScores(){

	//Loop for each player
	for(var player=1; player<=2; player++){
	
		var tempScore = 0; //Temporary score whilst calculating
		var currentTile;

		for (var x=0;x<hexmap._mapWidth;x++){
			for (var y=0;y<hexmap._mapHeight;y++){

				//Check if the tile is currently owned by current player
				currentTile = hexmap.getTile(x,y);
				if( currentTile && currentTile._owner == player ){
					tempScore += currentTile.value;
				};

				playerScores[player] = tempScore;


			}
		} //End hexmap loop

	}
	//Now update the scoreboard
	Crafty("Player1Score").each(function () { 
    	this.text("Your score: " + playerScores[1]);
    });

    Crafty("Player2Score").each(function () { 
    	this.text("Enemy score: " + playerScores[2]);
    });

}


function switchTile(tile, player, value){
	tile.owner = player;
	tile.value = value;
	tile.removeComponent("selected").addComponent("player"+player);
	tile.text(tile.value).css({
		"font-size"		: 32,
		"font-family"	: "arial",
		"text-align"	: "center",
		"color"			: "white",
		"line-height"	: 62 //,
        //"-webkit-animation" : "pulsate 1s ease-out",
        //"-webkit-animation-iteration-count" : "infinite"
	});

	//tile.attr({alpha: 1.0, x: 0, y: 0}).tween({alpha: 0.0, x: 100, y: 100}, 200)
	//tile.attr({w: 500, h: 500, x: 0, y: 0}); //.tween({ w: 300 }, 200);
	if(playSound==true){ Crafty.audio.play("tileFlip",1,0.3) }
}


