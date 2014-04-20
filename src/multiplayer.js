
function hostGame(){

	isHost		= true;
	gameName 	= generateGameName();
	gameType	= "netMulti";

	PUBNUB.subscribe({
		channel: 	gameName,
		restore: 	false,
		callback: 	function(message){ processMessage(message) },
		disconnect: function(){ disconnectGame() },
		reconnect: 	function(){ reconnectGame() },
		connect: 	function(){ connectGame() },
		error: 		function(e){ resolveError(e) }
	});

}

function joinGame(gameToJoin){

	isHost		= false;
	gameName 	= gameToJoin;
	thisPlayer	= 2;
	gameType	= "netMulti";
	
	PUBNUB.subscribe({
		channel: 	gameName,
		restore: 	false,
		callback: 	function(message){ processMessage(message) },
		disconnect: function(){ disconnectGame() },
		reconnect: 	function(){ reconnectGame() },
		connect: 	function(){ connectGame() },
		error: 		function(e){ resolveError(e) }
	});

}

//user wants to disconnect from game
function forceDisconnect(gameName){
	PUBNUB.unsubscribe({ 
		channel : gameName 
	});
	console.log("Disconnected");
}

//Send a message to the other player
function sendMessage(messageToSend){

	var encodedMessage = { 
		host: isHost, 
		data: messageToSend 
	}
	console.log("Sent: " + encodedMessage);

	PUBNUB.publish({
		channel: 	gameName,
		message: 	encodedMessage
		//,
		//callback:	function(message){ processMessage(message) }	
	})
}


//process incoming messages
function processMessage(message){

	console.log("RECEIVED:");
	console.log( JSON.stringify(message) );
	
	var messageFromHost = message.host;
	var messageData		= message.data;

	if(messageFromHost==true && isHost == false){
		//These message are FROM THE HOST, TO THE CLIENT
		console.log("FROM HOST, TO CLIENT");
		//console.log(messageData.gameMap);

		if(messageData.gameMap){
			multiplayerMap = messageData.gameMap;
			//newGame();
			Crafty.scene("gameBoard");

			//Now we've loaded the game map.. We should let the host know..
			sendMessage({"gameReady" : "true"});
		}

		

	} else if(messageFromHost==false && isHost == true) {
		//These message are FROM THE CLIENT, TO THE HOST
		console.log("FROM CLIENT, TO HOST");

		if(messageData.gameType=="client"){
			//This user is the host, and a client has connected.
			//Send over the generated game map
			console.log("Send map data");
			sendMessage( { "gameMap" : multiplayerMap } )
		}

		if(messageData.gameReady=="true"){
			//The client is ready to play.. generate a tile number, and send it back to the client
			tileValue = generateTileValue();
			updatePlayersTile(); //This function also sends to other player
		}

	}

	//General message that server and client can send/ receive
	if( (messageFromHost==true && isHost == false) || (messageFromHost==false && isHost == true)){

		if(messageData.generatedTileValue){
			//Other player has sent over a tile value to use
			tileValue = messageData.generatedTileValue;
			updatePlayersTile();
		}

		//sendMessage( { "placedTile" : array(tile.i,tile.j,value) } );
		if(messageData.placedTile){
			console.log(messageData.placedTile);
			claimTile(hexmap.getTile(messageData.placedTile[0], messageData.placedTile[1]), playersTurn, messageData.placedTile[2]);
		}

	}

	//console.log(message.gameType);

}


//handle disconnections
function disconnectGame(){
	alert("Connection lost");
}


//handle re-connections
function reconnectGame(){
	alert("Reconnected?");
}


//handle game connection
function connectGame(){

	if(isHost==true){
		//User is the host
		sendMessage({"gameType" : "host"});		

	} else {
		//user is the client
		sendMessage({"gameType" : "client"});
	}

}


//Resolve any errors
function resolveError(e){
	console.log(e);
}



//Generates a string for a room named - Forced to LOL for now
function generateGameName(){
	return "lol";	
}