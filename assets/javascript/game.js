//Configure Firebase connection
var config = {
    apiKey: "AIzaSyA7NU6DtU28B200f7z6zBbiZFMUFlPj1lw",
    authDomain: "videogladiators-81826.firebaseapp.com",
    databaseURL: "https://videogladiators-81826.firebaseio.com",
    storageBucket: "videogladiators-81826.appspot.com",
    messagingSenderId: "1028142233498"
};

firebase.initializeApp(config);
var database = firebase.database();

//Game status database references
var gameStatus = database.ref('/gameStatus');

//Game data stores local data for the player
var gameData = {
    totalPlayers: 0,
    targetStage: 0,
    currentStage: 0,
    videoId: '',
    correctAnswer: null,
    clickedAnswer: false,
    playingGame: false,
    host: null,
    maxAnswers: 5
}

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

// Action when player 1 clicks "enter the arena"
$("#start-button").click(function() {
    if ($("#username").val() !== "") {
        username = capitalize(($("#userName").val().trim()));
        enterGame();

        $("#start-button, #userName").hide();
        $(".jumbotron, video").slideUp(1000);

        if(playerNum == 1){ 
            $(".welcome").show();
        }
    }
});

$("#userName").keypress(function(e){
    if(e.keyCode === 13 && $("#username").val()!==""){
        username = capitalize($("#userName").val().trim());
        enterGame();
        
        $("#start-button, #userName").hide();
        $(".jumbotron, video").slideUp(1000);

        if(playerNum == 1){ 
            $(".welcome").show();
        }
    }
});

function capitalize(name){
    return name.charAt(0).toUpperCase()+ name.slice(1);
 }

 function activePlayer(){
    //If player has been assigned number and it is 1 or 2
    if(playerNum != null && playerNum <= 2){
        return true;
    } else {
        return false;
    }
 }

// Display player 1 username in "welcome" div
function enterGame() {
    if (currentPlayers < 2) {
        if (playerOneOnline) {
            console.log('assign player 2');
            playerNum = 2;
            gameData.host = false;
        } else {
            playerNum = 1;
            console.log('assign player 1');
            gameData.host = true;
            gameData.targetStage = 0;
            gameData.currentStage = 0;

            //Host player calls hostUpdate to reset Firebase to default values
            hostUpdate(0);
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
        //Add a waiting player to database
        playerNum = currentPlayers + 1;
        playerTree = database.ref("/players/" + playerNum);
        playerTree.set({
            name: username,
            status: 'waiting'
        });
        playerTree.onDisconnect().remove();

        $(".score, #player, .main").show();
        $("#video-placeholder").hide();
        $('.answer').css('visibility', 'hidden');
    }
};

//Runs whenever players are modified in Firebase
playersTree.on("value", function(snapshot) {
    currentPlayers = snapshot.numChildren();

    playerOneOnline = snapshot.child("1").exists();
    playerTwoOnline = snapshot.child("2").exists();
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();
    
    if (currentPlayers >= 2 && !gameData.playingGame) {

        if(activePlayer()){
            $("#login-switch").hide();
            $("#start-button, #userName").hide();
            $(".welcome").hide();
            gameData.playingGame = true;
            countdown();
        } else {
            startTrivia();
        }
    } else if (currentPlayers < 2){
        //If the current playerNum is 3 (i.e. next in line), assign to open player
        if(playerNum === 3){
            //console.log('take over open play');
        } else {
            //Host player resets game data
            gameData.targetStage = 0;
            gameData.currentStage = 0;
        }
    }

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
});

//Player 1 (host) updates the relevant data in Firebase
function hostUpdate(stageAddition){
    //The function is called by both players but only the host player will send game data
    if(gameData.host){
        //Add stages based on parameter
        gameData.targetStage += stageAddition;
        //Set info in Firebase
        gameStatus.set({
            gameStage: gameData.targetStage,
            videoId: gameData.videoId
        });
    }
}

//Runs whenever the game status is updated in Firebase
gameStatus.on('value', function(splash){

    if(gameData.playingGame){
        //Get the current stage of the game as stored in Firebase
        var stage = splash.val().gameStage;

        //If the player's current stage is different than the one directed in Firebase, run stage-specific functions
        if(stage != gameData.currentStage){
            gameData.currentStage = stage;
            //Stage 1: Host sends video. Opponent awaits video.
            if(stage === 1  && activePlayer()){
                if(gameData.host){
                    //Get random video ID from video.js
                    var newVideo = selectRandomVideo();
                    gameData.videoId = newVideo;
                    gameData.clickedAnswer = false;
                    hostUpdate(1);
                }

            //Stage 2: Both players retrieve video ID pushed to Firebase in previous stage
            } else if(stage === 2){
                //Retrieve video ID for both players
                gameData.videoId = splash.val().videoId;

                //gameData.correctAnswer will be detailed in video.js / getVideoYear()
                getVideoYear(gameData.videoId);
                hostUpdate(1);

            //Stage 3: Begin playing the video and register that no answers have been provided
            } else if(stage === 3){
                playVideoById(gameData.videoId);
                gameData.totalAnswers = 0;

            //Stage 4: One answer from either player recieved.
            } else if(stage === 4  && activePlayer()){
                if(gameData.clickedAnswer){
                    $("#gameTimer").text('Waiting for other player...');
                }

            //Stage 5: Responses from both players received
            } else if(stage === 5  && activePlayer()){
                hostUpdate(1);

            //Stage 6: Stop timer for both players and countdown to next round
            } else if(stage === 6){
                stop();
                $("#gameTimer").text("Next round about to begin!");
                setTimeout(startTrivia, 1000 * 3);

            //Stage 7: Test if max videos viewed
            } else if(stage === 7){
                //If max answers not completed, reset to stage 1
                if(total_answer != gameData.maxAnswers){
                    gameData.targetStage = 0;
                }
                hostUpdate(1);

            //Stage 8: Game is over
            } else if(stage === 8){
                $("#question").text("Game over!");                
                stop();
                showEndGame();
            }
        }
    }
}); 

// Action after player 2 signs in and clicks "enter" - only runs once
function countdown() {
    timer = 5;
    intervalID = setInterval(decrement1, 1000);
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");  
    $(".main").show();
    $("#video-placeholder").fadeOut(5000);
    $("#player, .answer, .score").hide();
    $(".welcome").hide();
    $(".answerPlaceholder").empty();
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
        $("#question").text("What year was this video released?");
        if(activePlayer()){
            $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
        } else {
            $("#gameTimer").text('Waiting until next game...');
        }
        $("#timer").hide();
        $(".answerPlaceholder").remove();
        $(".score, #player").show();
    if(activePlayer()){
        timer = 15;
        intervalID = setInterval(decrement2, 1000);
        $(".answer").show();

        //With 2 players, trigger hostUpdate() to start game stage advancing
        gameData.clickedAnswer = false;
        hostUpdate(1);
    } else {
        $(".answer").show();
        gameData.playingGame = true;
        waitForGame();
    }
}

// This is the clock counting down and restarting
function decrement2() {
    timer--;
    $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
    if (timer === 0) {
        //If timer runs our, player automatically loses round
        stop();
        //Don't allow for any more clicks
        gameData.clickedAnswer = true;

        //Force incorrect answer
        total_answer ++;
        playerTree.update({
            wins:correct_answer,
            losses:total_answer - correct_answer
        });

        //Force stage to advance
        gameData.targetStage++;
        gameStatus.update({
            gameStage: gameData.targetStage
        });

        $("#gameTimer").text("Time's up!");
    }
}

function stop() {
    clearInterval(intervalID);
}

var generate_multipleChoices = function(correct_answer){
    multipleChoices = [correct_answer];
    var index = 0;
    while (index < 3){
        var randomNumber = correct_answer + math.randomInt(-5, 5);
        if (multipleChoices.indexOf(randomNumber) === -1 && randomNumber < 2018){
            multipleChoices.push(randomNumber);
            index ++;
        }
    }
    multipleChoices.sort();
}

var AddChoice_to_DOM =  function(){
    for(var i = 1; i <= 4; i++){
        $("#answer" + i).html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[i-1]);
    }
}

$(".answer").on("click", function() {
    if(!gameData.clickedAnswer){
        gameData.clickedAnswer = true;
        stop();

        //Force a single stage update
        gameData.targetStage++;
        gameStatus.update({
            gameStage: gameData.targetStage
        });

        total_answer ++;
        if ($(this).text().trim()==gameData.correctAnswer){
            $("#question").text("You're correct!");
            correct_answer ++;
            playerTree.update({
                wins: correct_answer,
                losses: total_answer - correct_answer
            });
        } else {
            $("#question").text("Wrong! The correct answer is " + gameData.correctAnswer);
            playerTree.update({
                wins:correct_answer,
                losses:total_answer - correct_answer
            });
        }
    }
});

function showEndGame(){
    if(activePlayer()){
        //This will happen for players 1 and 2
    } else {
        //This will happen for waiting players
    }
}

function restartGame(){
    //The following needs to happen at some point to restart the game
    //Maybe change text and set this on a timer?
    total_answer = 0;
    gameData.currentStage = 0;
    gameData.targetStage = 0;
    startTrivia();
    //
}

// A few divs we have to hide at the start of the game
$(".main, .welcome").hide();