
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
$(".welcome").hide();


$("#start-button").click(function() {
    if ($("#username").val() !== "") {
        username = ($("#userName").val().trim());
        $("#start-button").hide();
        $(".jumbotron").slideUp(1000);
        $("video").slideUp(1000);
        $("#userName").hide();
        $(".welcome").show();
        enterGame();
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
    }

function countdown() {
    timer = 5;
    intervalID = setInterval(decrement1, 1000);
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");  
    $(".main").show();
    $("#video-placeholder").fadeOut(5000);
    $("#video-player").hide();
    $(".welcome").hide();
    $(".answerPlaceholder").empty();
    $(".answer").hide();
    $(".score").hide();
}

function displayNames () {
    $("#player1-name").text(playerOneData.name);
    $("#player2-name").text(playerTwoData.name);
}

displayNames();

function decrement1() {
    timer--;
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
        if (timer === 0) {
            stop();
            startTrivia();
        }
}

function startTrivia() {
    timer = 15;
    intervalID = setInterval(decrement2, 1000);
    $("#question").text("What year was this video released?");
    $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
    $("#timer").hide();
    $(".answerPlaceholder").remove();
    $(".answer").show();
    $(".score").show();
    $("#video-player").show();
}

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




