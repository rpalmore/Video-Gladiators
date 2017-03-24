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
var username = "";
var playerOneOnline = false;
var playerTwoOnline = false;
var playerOneData = null;
var playerTwoData = null;
var playerNum = null;


$("#start-button").click(function() {
	alert("clicked");
	if ($("#username").val() !== "") {
		username = ($("#userName").val().trim());
		enterGame();
		alert("new user added");
	}
});


// playerTree.on("child_added", function(snapshot) {
// 	if (currentPlayers === 1) {
// 	}
// });

// this function is just listening to what is happeing to the database
// similar to the rps game have an online counter to determ player number
playerTree.on("value", function(snapshot) {

	currentPlayers = snapshot.numChildren();
	console.log("current number of players: " + currentPlayers);

	playerOneOnline = snapshot.child("1").exists();
	console.log(playerOneOnline);
	playerTwoOnline = snapshot.child("2").exists();
	console.log(playerTwoOnline);

	playerOneData = snapshot.child("1").child("name").val();
	

	console.log(playerOneData);
	

	playerTwoData = snapshot.child("2").val();
	

	console.log(playerTwoData);


	if (playerOneOnline) {
		$("#player1-name").text(playerOnedata.name);
	}
	else {
		$("#player1-name").text("waiting for player 1");
	}

	if (playerTwoOnline) {
		$("#player2-name").text(playerTwodata.name);
	}
	else {
		$("#player2-name").text("waiting for player 2");
	}

});


function enterGame() {

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
			wins: 0,
			losses: 0
		});

	playerTree.onDisconnect().remove();

	$("#login-switch").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");

	}

	else {
		alert("game is full");
	}
}