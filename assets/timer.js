
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
// ADDED CHAT HERE
var chatData = database.ref("/chat");
// END

// A few divs we have to hide at the start of the game

$(".main, .welcome").hide();

// Action when player 1 clicks "enter the arena"

$("#start-button").click(function() {
    if ($("#username").val() !== "") {
        username = capitalize($("#userName").val().trim());
        $("#start-button, #userName").hide();
        $(".jumbotron, video").slideUp(1000);
        $(".welcome").show();
        enterGame();
    }
});

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ADDED CHAT HERE
// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {

  if ($("#chat-input").val() !== "") {

    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });

    $("#chat-input").val("");
  }
});

// Chatbox input listener

$("#chat-input").keypress(function(e) {

  if (e.keyCode === 13 && $("#chat-input").val() !== "") {

    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });

    $("#chat-input").val("");
  }
});
// END

// Display player 1 username in "welcome" div

function enterGame() {

    if (currentPlayers < 2) {
        if (playerOneOnline) {
            playerNum = 2;
        }
        else {
            playerNum = 1;
        }
        
        // ADDED CHAT FUCTION HERE
        var chatDataDisc = database.ref("/chat/" + Date.now());
        // END

        playerTree = database.ref("/players/" + playerNum);

        playerTree.set({
            name: username,
            wins: 0,
            losses: 0
        });

        // ADDED CHAT FUCTION HERE
        // Update chat on screen when new message detected - ordered by 'time' value
        chatData.orderByChild("time").on("child_added", function(snapshot) {

        // If idNum is 0, then its a disconnect message and displays accordingly
        // If not - its a user chat message
        if (snapshot.val().idNum === 0) {
            $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
            + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
            }
        else {
            $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
            + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
            }

        // Keeps div scrolled to bottom on each update.
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        });

    playerTree.onDisconnect().remove();

    // ADDED CHAT FUCTION HERE
    // Send disconnect message to chat with Firebase server generated timestamp 
    // and id of '0' to denote system message
      chatDataDisc.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
       });
      //END

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

function displayNames () {
    $("#player1-name").text(playerOneData.name);
    $("#player2-name").text(playerTwoData.name);
}

displayNames();

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

});


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

$("#chat-send").hover(function(){
    $(this).css("background-color", "#fdd865");
    }, function(){
        $(this).css("background-color", "white");
});

  // ADDED CHAT FUCTION HERE
  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNum === 0) {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  else {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
// END



