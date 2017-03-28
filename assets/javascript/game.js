//Configure Firebase connection
var config = {
	apiKey: "AIzaSyB6dvUdBGMWjFbn0V6-nd7AAq5iHwoQbJU",
	authDomain: "megacow-1cf45.firebaseapp.com",
	databaseURL: "https://megacow-1cf45.firebaseio.com",
	storageBucket: "megacow-1cf45.appspot.com",
	messagingSenderId: "182729803547"
};
firebase.initializeApp(config);

var database = firebase.database();

//References for players, game, and connections
var playersRef = database.ref('/players');
var gameInfo = database.ref('/gameinfo');
var connectedRef = database.ref(".info/connected");

//Player data stores the player number and whether or not they are the host player (player 1 only)
var playerData = {
	playerNum: null,
	host: null
}

//Game data includes staging information about current play round
var gameData = {
	totalPlayers: 0,
	targetStage: 0,
	currentStage: 0,
	videoId: '',
	correctAnswer: null
}

//Game stages prototype: 0 = awaiting players, 1 = send new video, 2 = await answers, 3 = show answers

//Add listener for new players
connectedRef.on("value", function(snap) {
	if (snap.val()) {
		var con = playersRef.push(true);
		con.onDisconnect().remove();
	}
});

//When player joins game, modifies their player data
playersRef.on("value", function(snap) {
	gameData.totalPlayers = snap.numChildren();

	//If player has not yet been assigned a player number...
	if(playerData.playerNum == null){
		//Assign current player number to player info
		playerData.playerNum = gameData.totalPlayers;
		if(playerData.playerNum === 1){
			playerData.host = true;
			//Call hostUpdate to reset Firebase to default values
			hostUpdate();
		} else {
			playerData.host = false;
		}
	}

	//If 2 players are available, the host player calls to start the game
	if(gameData.totalPlayers === 2 && playerData.host){
		//Advance the target game stage
		gameData.targetStage++;
		//With 2 players, trigger hostUpdate() to start game stage advancing
		hostUpdate();
	}
});

function hostUpdate(){
	//The function is called by both players but only the host player will send game data
	if(playerData.host){
		//Send current game info to Firebase if player is the host
		gameInfo.set({
			gameStage: gameData.targetStage,
			videoId: gameData.videoId
		});
		console.log('hostUpdate() called by this player.');
	}
}

//Whenever gameInfo is modified on Firebase (i.e. the game stage is updated) search for current stage and take appropriate actions
gameInfo.on('value', function(splash){
	//Get the current stage of the game as stored in Firebase
	var stage = splash.val().gameStage;
	console.log('This player is in stage ' + gameData.currentStage + '. They need to be at stage ' + stage + '.');

	//If the *player's* current stage is different than the one directed in Firebase, run stage-specific functions
	if(stage != gameData.currentStage){
		gameData.currentStage = stage;

		//If target stage == 1, host sends video. Opponent awaits video
		if(stage === 1){
			if(playerData.host){
				//Get random video ID from addvideo.js
				var newVideo = selectRandomVideo();
				console.log(newVideo);
				gameData.videoId = newVideo;
				//Advance the stage
				gameData.targetStage++;
				//Hose updates Firebase
				hostUpdate();

				console.log('Host has sent a video ID: ' + newVideo);
			}

		//If target stage == 2, both players retrieve video ID pushed in previous stage
		} else if(stage === 2){
			//Retrieve video ID for both players
			gameData.videoId = splash.val().videoId;

			//Set the correct answer as the year the video was published (via addvideo.js)
			getVideoYear(gameData.videoId);
			
			console.log('Video ID retrieved from server: ' + gameData.videoId);

			//Host advances stage
			if(playerData.host){
				gameData.targetStage++;
				hostUpdate();
			}
		} else if(stage === 3){
			//
		} else if(stage === 4){
			//
		}
	}
});