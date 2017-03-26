
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCJjoqV8O6mAQKVXOGStzDdNiK1OYiQ-hc",
    authDomain: "test-b2024.firebaseapp.com",
    databaseURL: "https://test-b2024.firebaseio.com",
    storageBucket: "test-b2024.appspot.com",
    messagingSenderId: "1048353574850"
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

$(".main").hide();
$(".row").hide();
$(".welcome").hide();
// $(".waiting").hide();

// Need to add interstitial here for "waiting" player
// What happens after they click "enter"?
// Waiting for player 2

// function waitingPlayer2() {
//     $("#start-button").on("click", function() {
//     $("#start-button").hide();
//     $(".jumbotron").slideUp(1000);
//     $("video").slideUp(1000);
//     $("#userName").hide();
//     $(".welcome").show();
//     $(".welcome").html("Welcome, " + "player1-name" + ("<p>")
//         + "Waiting for player 2");
//         if (playerOneOnline && playerTwoOnline);
//             countdown();
//     })
// }


// waitingPlayer2();


$("#start-button").click(function() {
    if ($("#username").val() !== "") {
        username = ($("#userName").val().trim());
        $("#start-button").hide();
        $(".jumbotron").slideUp(1000);
        $("video").slideUp(1000);
        $("#userName").hide();
        $(".welcome").show();
        // $(".waiting").show();
        // $(".waiting").html("We are waiting for player 2 ...");
        enterGame();
    }
});


function countdown() {
    timer = 5;
    intervalID = setInterval(decrement1, 1000);
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
    $("#video-placeholder").fadeOut(5000);
    $(".main").show();
    $(".row").show();
    $(".welcome").hide();
}


function decrement1() {
    timer--;
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
        if (timer === 0) {
            stop();
            questionTimer();
        }
}

function questionTimer() {
    timer = 15;
    intervalID = setInterval(decrement2, 1000);
    $("#timer").text("What year was this video released?");
    $("#question").text("You have:" + (" ") + timer + (" ") + "seconds");
}


function decrement2() {
    timer--;
    $("#question").text("You have:" + (" ") + timer + (" ") + "seconds");
        if (timer === 0) {
        stop();
        $("#question").text("Time's up!");
        setTimeout(questionTimer, 1000 * 3);
    }
}


function stop() {
	clearInterval(intervalID);
}

// function revealQuestions() {
// }

// function revealAnswer() {
// 	$("#answer1, #answer2, #answer3").fadeOut(1000);
// }


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



playersTree.on("value", function(snapshot) {

    // scoreBoard();

    currentPlayers = snapshot.numChildren();
    

    playerOneOnline = snapshot.child("1").exists();
    playerTwoOnline = snapshot.child("2").exists();
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();
    
    if (currentPlayers === 2) {
        countdown();
    }


    // if (playerOneOnline) {
    //     $("#player1-name").text(playerOneData.name);
    //     $("#player1-wins").text("WINS : " + playerOneData.wins);
    //     $("#player1-losses").text("LOSSES : " + playerOneData.losses);
    // }
    // else {
    //     $("#player1-name").text("waiting for player 1");
    //     $("#player1-wins").text("x");
    //     $("#player1-losses").text("x");
    // }

    // if (playerTwoOnline) {
    //     $("#player2-name").text(playerTwoData.name);
    //     $("#player2-wins").text("WINS : " + playerTwoData.wins);
    //     $("#player2-losses").text("LOSSES : " + playerTwoData.losses);
    // }
    // else {
    //     $("#player2-name").text("waiting for player 2");
    //     $("#player2-wins").text("x");
    //     $("#player2-losses").text("x");
    // }

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

    $(".youArePlayer").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");



    }

    else {
        alert("NO MORE SPACE");
    }

};


