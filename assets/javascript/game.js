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

//Game status database references
var gameInfo = database.ref('/gameInfo');

//Game data stores local data for the player
var gameData = {
    totalPlayers: 0,
    targetStage: 0,
    currentStage: 0,
    currentAnswers: 0,
    videoId: '',
    correctAnswer: null,
    playerNum: null,
    host: null
}

//Player 1 (host) updates the relevant data in Firebase
function hostUpdate(){
    //The function is called by both players but only the host player will send game data
    if(gameData.host){
        //Send current game info to Firebase if player is the host
        gameInfo.set({
            gameStage: gameData.targetStage,
            videoId: gameData.videoId
        });
        console.log('hostUpdate() called by this player.');
    }
}

//Shortcut function to advance game stage and trigger hostUpdate
function triggerHost(){
    if(gameData.host){
        gameData.targetStage++;
        hostUpdate();
    }
}

var generate_multipleChoices = function(correct_answer){
    multipleChoices = [correct_answer];
    var index = 0;
    while (index < 3){
        var randomNumber = correct_answer + math.randomInt(-10,10);
        if (multipleChoices.indexOf(randomNumber) === -1){
            multipleChoices.push(randomNumber);
            index ++;
        }
    }
    multipleChoices.sort();
}

var AddChoice_to_DOM =  function(){
    $("#answer1").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[0]);
    $("#answer2").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[1]);
    $("#answer3").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[2]);
    $("#answer4").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[3]);
}

//Whenever gameInfo is modified on Firebase (i.e. the game stage is updated) search for current stage and take appropriate actions
// Game stages prototype: 0 = awaiting players, 1 = send new video, 2 = await answers, 3 = play video, 4 = await answers
// 5 = 1 answer, 6 = both answers, 7 = show answers, 8 = reset to 1

gameInfo.on('value', function(splash){
    //On first load (no players) reset game stage to 0
    if(currentPlayers == null){
        gameData.targetStage = 0;
        gameData.currentStage = 0;
        gameInfo.update({
            gameStage: 0
        });
    }

    //Get the current stage of the game as stored in Firebase
    var stage = splash.val().gameStage;
    console.log('This player is in stage ' + gameData.currentStage + '. They need to be at stage ' + stage + '.');

    //If the *player's* current stage is different than the one directed in Firebase, run stage-specific functions
    if(stage != gameData.currentStage){
        gameData.currentStage = stage;

        //If target stage == 1, host sends video. Opponent awaits video
        if(stage === 1){
            if(gameData.host){
                //Get random video ID from addvideo.js
                var newVideo = selectRandomVideo();
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

            //gameData.correctAnswer will be detailed in video.js / getVideoYear()
            getVideoYear(gameData.videoId);
            console.log('Video ID retrieved from server: ' + gameData.videoId);

            //Host advances stage
            triggerHost()
        } else if(stage === 3){
            playVideoById(gameData.videoId);
            triggerHost();
        } else if(stage === 4){
            console.log('awaiting first answer');
            //Check button clicks
        }
    }
}); 

var timer = 15;
var intervalID;
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
var multipleChoices = [];

// Display player 1 username in "welcome" div
function enterGame() {
    if (currentPlayers < 2) {
        if (playerOneOnline) {
            playerNum = 2;
            gameData.host = false;
        }
        else {
            playerNum = 1;
            gameData.host = true;
            //Call hostUpdate to reset Firebase to default values
            hostUpdate();
        }
        playerTree = database.ref("/players/" + playerNum);

        playerTree.set({
            name: username,
            wins: 0,
            losses: 0
        });

        playerTree.onDisconnect().remove();

        $(".youArePlayer").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");
    } else {
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
    } else if (playersTree.onDisconnect()) {
        console.log("player was disconnected!");
    }
});

// Action after player 2 signs in and clicks "enter"
function countdown() {
    timer = 5;
    intervalID = setInterval(decrement1, 1000);
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");  
    $(".main").show();
    $("#video-placeholder").fadeOut(5000);
    $("#player, .welcome, .answer, .score").hide();
    $(".answerPlaceholder").empty();
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
    $(".answer, .score, #player").show();

    //With 2 players, trigger hostUpdate() to start game stage advancing
    gameData.targetStage++;
    hostUpdate();
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

//Add button clicks

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

$(".answer").on("click", "p", function() {
    console.log('clicked answer');
    total_answer ++;
    if ($(this).text().trim()==1998){
            correct_answer ++;
            playerTree.update({
            wins: correct_answer,
            losses: total_answer - correct_answer
            });
        } else{
            playerTree.update({
            wins:correct_answer,
            losses:total_answer - correct_answer
        });
    }
});

// Add button styles
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

// A few divs we have to hide at the start of the game
$(".main, .welcome").hide();

// Writing usernames to the DOM
if (playerOneOnline) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("WINS : " + playerOneData.wins);
    $("#player1-losses").text("LOSSES : " + playerOneData.losses);
} else {
    $("#player1-name").text("DISCONNECTED");
    $("#player1-wins").text("x");
    $("#player1-losses").text("x");
}
if (playerTwoOnline) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("WINS : " + playerTwoData.wins);
    $("#player2-losses").text("LOSSES : " + playerTwoData.losses);
} else {
    $("#player2-name").text("DISCONNECTED");
    $("#player2-wins").text("x");
    $("#player2-losses").text("x");
}

