
//Function to call the AI player to have it's turn
function aiTurn(){
	//console.log("aiTurn called");

	var topScore 	= 0;	//Top Ai Score
	var topTile		= null; //Top tile so far

	var possibleX	= new Array();
	var possibleY	= new Array();	
	
	var aiTileValue =  tileValue; //Math.floor(Math.random()*20)+1;

	//console.log(hexmap);

	//Loop through all tiles and grab score values
	for (var x=0;x<hexmap._mapWidth;x++){
		for (var y=0;y<hexmap._mapHeight;y++){

			//Check if the tile is currently available to take
			if( hexmap.getTile(x,y) && hexmap.getTile(x,y)._owner == 0 ){
				//console.log( hexmap.getTile(x,y) );
				possibleX.push(x);
				possibleY.push(y);

				score = checkScore(x, y, aiTileValue);
				if(score > topScore){
					//Best tile so far
					topScore = score;
					topTile = hexmap.getTile(x,y);
				}
			}

		}
	}
	//Finished looping through tiles

	if(topScore > 0){
		if(aiLevel == 3){
			claimTile(topTile, 2, tileValue);
		}
	} else {
		//There's no top score.. Going to have to place a random tile
		var len = possibleX.length;
		var rnd = Math.floor(Math.random()*len);

		claimTile(
			hexmap.getTile(possibleX[rnd],possibleY[rnd]), 
			2, tileValue );
	}



}


//Check the score for a given tile, by checking adjacent tiles
function checkScore(x, y, aiTileValue){
	var score = 0;
	var surrounding = hexmap.getAdjacentTiles(x,y);	

	surrounding.forEach(function(tile){
		//console.log("Return: " + getScore(tile, aiTileValue));
		score += getScore(tile, aiTileValue);
	})
	//console.log(score);
	return score;
}

//Calculates the score for a given tile, based on owner and values
function getScore(tile, aiTileValue){

	//console.log("Owner: " + tile.owner);

	if(tile.owner == 1){
		//Enemy player owns it
		if(tile.value >= aiTileValue){
			//console.log("ENEMY HIGHER");
			return 0;
		} else {
			//console.log("ENEMY LOWER")
			return tile.value;
		};
	} else if(tile.owner == 2) {
		//AI Player owns it
		//console.log("OWNED")
		return 1;
	} else {
		//Nobody currently owns this tile
		//console.log("BLANK")
		return 0;
	}

}