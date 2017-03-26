
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAznUZ10oaloQU9P2Jm1UwDOegZzwoIB-s",
    authDomain: "test-1-df1ad.firebaseapp.com",
    databaseURL: "https://test-1-df1ad.firebaseio.com",
    storageBucket: "test-1-df1ad.appspot.com",
    messagingSenderId: "600600072308"
  };
  firebase.initializeApp(config);


var timer = 15;
var intervalID;
var database = firebase.database();
var playersTree = database.ref("players");
var answersTree =  database.ref("answers");
var currentPlayers = null;
var username = "User";
var playerOneOnline = false;
var playerTwoOnline = false;
var playerOneData = null;
var playerTwoData = null;
var playerNum = null;
var total_answer = 0;
var correct_answer = 0;

// A few divs we have to hide at the start of the game

$(".main, .welcome").hide();

// Action when player 1 clicks "enter the arena"

$("#start-button").click(function() {
    if ($("#username").val() !== "") {
        username = ($("#userName").val().trim());
        $("#start-button, #userName").hide();
        $(".jumbotron, video").slideUp(1000);
        $(".welcome").show();
        enterGame();
    }
});

// Display player 1 username in "welcome" div

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

    $(".youArePlayer").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");

    }

    else {
        alert("NO MORE SPACE");
    }

};

playersTree.on("value", function(snapshot) {

    // scoreBoard();

    currentPlayers = snapshot.numChildren();
    

    playerOneOnline = snapshot.child("1").exists();
    playerTwoOnline = snapshot.child("2").exists();
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();
    
    if (currentPlayers === 2) {
        countdown();
        $("#login-switch").hide();
        $("#start-button, #userName").hide();
        $(".welcome").hide();
    }
    else if (playersTree.onDisconnect()) {
        console.log("player was disconnected!");

    }

// Action after player 2 signs in and clicks "enter"

function countdown() {
    timer = 5;
    intervalID = setInterval(decrement1, 1000);
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");  
    $(".main").show();
    $("#video-placeholder").fadeOut(5000);
    $("#video-player, .welcome, .answer, .score").hide();
    $(".answerPlaceholder").empty();
}

// Writing usernames to the DOM
if (playerOneOnline) {
        $("#player1-name").text(playerOneData.name);
        $("#player1-wins").text("WINS : " + playerOneData.wins);
        $("#player1-losses").text("LOSSES : " + playerOneData.losses);
    }
    else {
        $("#player1-name").text("DISCONNECTED");
        $("#player1-wins").text("x");
        $("#player1-losses").text("x");
    }

    if (playerTwoOnline) {
        $("#player2-name").text(playerTwoData.name);
        $("#player2-wins").text("WINS : " + playerTwoData.wins);
        $("#player2-losses").text("LOSSES : " + playerTwoData.losses);
    }
    else {
        $("#player2-name").text("DISCONNECTED");
        $("#player2-wins").text("x");
        $("#player2-losses").text("x");
    }


// This is our timer countdown function for the pre-game clock

function decrement1() {
    timer--;
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
        if (timer === 0) {
            stop();
            startTrivia();
        }
}

// This is our timer countdown for the trivia questions. We will need a loop
// around this eventually I think, to get to the final page after 15 rounds.

function startTrivia() {
    timer = 15;
    intervalID = setInterval(decrement2, 1000);
    $("#question").text("What year was this video released?");
    $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
    $("#timer").hide();
    $(".answerPlaceholder").remove();
    $(".answer, .score, #video-player").show();
}

// This is the clock counting down and restarting

function decrement2() {
    timer--;
    $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
        if (timer === 0) {
        stop();
        $("#gameTimer").text("Time's up!");
        setTimeout(startTrivia, 1000 * 3);
    }
}

function stop() {
    clearInterval(intervalID);
}

// Some button styles

$("#start-button").hover(function(){
    $(this).css("background-color", "#fdd865");
    }, function(){
        $(this).css("background-color", "white");
});

$("#userName").hover(function(){
    $(this).css("background-color", "#fdd865");
    }, function(){
        $(this).css("background-color", "white");
});

});




