var config = {
	apiKey: "AIzaSyAznUZ10oaloQU9P2Jm1UwDOegZzwoIB-s",
	authDomain: "test-1-df1ad.firebaseapp.com",
	databaseURL: "https://test-1-df1ad.firebaseio.com",
	storageBucket: "test-1-df1ad.appspot.com",
	messagingSenderId: "600600072308"
};
  

firebase.initializeApp(config);

var database = firebase.database();

var playerTree = database.ref("players");
var currentPlayers = null;
var username = "User";
var playerOneOnline = false;
var playerTwoOnline = false;
var playerOneData = null;
var playerTwoData = null;
var playerNum = null;
var wins = 0;
var losses = 0;


$("#start-button").click(function() {
	if ($("#username").val() !== "") {
		username = ($("#userName").val().trim());
		enterGame();
	}
});


// playerTree.on("child_added", function(snapshot) {
// 	if (currentPlayers === 1) {
// 	}
// });

// this function is just listening to what is happeing to the database
// similar to the rps game have an online counter to determ player number
playerTree.on("value", function(snapshot) {

	// scoreBoard();

	//this line determins weather or not players have been created. if non the number of children in firebase will be 0;
	currentPlayers = snapshot.numChildren();
	console.log("current number of players: " + currentPlayers);

	playerOneOnline = snapshot.child("1").exists();
	console.log(playerOneOnline);
	playerTwoOnline = snapshot.child("2").exists();
	console.log(playerTwoOnline);

	playerOneData = snapshot.child("1").val();
	console.log(playerOneData);
	playerTwoData = snapshot.child("2").val();
	console.log(playerTwoData);


	if (playerOneOnline) {
		$("#player1-name").text(playerOneData.name);
		$("#player1-wins").text("WINS : " + playerOneData.wins);
		$("#player1-losses").text("LOSSES : " + playerOneData.losses);
	}
	else {
		$("#player1-name").text("waiting for player 1");
		$("#player1-wins").text("x");
		$("#player1-losses").text("x");
	}

	if (playerTwoOnline) {
		$("#player2-name").text(playerTwoData.name);
		$("#player2-wins").text("WINS : " + playerTwoData.wins);
		$("#player2-losses").text("LOSSES : " + playerTwoData.losses);
	}
	else {
		$("#player2-name").text("waiting for player 2");
		$("#player2-wins").text("x");
		$("#player2-losses").text("x");
	}

});


function enterGame() {

	//in this function we assign the player number and limit it to 2;
	if (currentPlayers < 2) {
		if (playerOneOnline) {
			playerNum = 2;
		}
		else {
			playerNum = 1;
		}
	

		playerTree = database.ref("/players/" + playerNum);

		playerTree.set({
			name: username,
			wins: wins,
			losses: losses
		});

	playerTree.onDisconnect().remove();

	$("#login-switch").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");

	}

	else {
		alert("game is full");
	}
};

scoreBoard();

function scoreBoard() {

	$(document.body).on("click", "#answer1", function() {
		
		// this is the part where it will key in on what play you are and only set/update your wins vs losses. at the moment i only tested to key in on wins player 1 vs wins player 2
		if (playerNum === 1) {
			wins++;

			database.ref("/players/" + playerNum).update({wins});

			console.log(playerOneData.wins);
		}
		else if (playerNum === 2) {
			wins++;

		//im leaving this code here for player 2 to compare with the updated code in the player 1 funciton.
			database.ref("/players/" + playerNum).set({
				name: username,
				wins: wins,
				losses: losses
			});
		}
	});

}












