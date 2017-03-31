//Configure Firebase connection
var config = {
apiKey: "AIzaSyDyjAZ5RiWX0Pt5dkiMEJ_tXbY1Z7M63Uc",
authDomain: "musicchallenge-86176.firebaseapp.com",
databaseURL: "https://musicchallenge-86176.firebaseio.com",
storageBucket: "musicchallenge-86176.appspot.com",
messagingSenderId: "666483398318"
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
    videoId: '',
    correctAnswer: null,
    clickedAnswer: false,
    playingGame: false,
    playerNum: null,
    host: null
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
var img_url;

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
        if (multipleChoices.indexOf(randomNumber) === -1 && randomNumber <=2017){
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

//Whenever gameInfo is modified on Firebase (i.e. the game stage is updated) search for current stage and take appropriate actions
// Game stages prototype: 0 = awaiting players, 1 = send new video, 2 = await answers, 3 = play video, 4 = await answers
// 5 = 1 answer, 6 = both answers, 7 = show answers, 8 = reset to 1

gameInfo.on('value', function(splash){
    console.log('gameInfo');
    //On first load (no players) reset game stage to 0
    if(currentPlayers == null){
        gameData.targetStage = 0;
        gameData.currentStage = 0;
        gameInfo.update({
            gameStage: 0
        });
    }

    if(gameData.playingGame){
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
                    gameData.clickedAnswer = false;
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
                gameData.totalAnswers = 0;
            } else if(stage === 4){
                console.log('receive first answer');
                if(gameData.clickedAnswer){
                    $("#gameTimer").text('Waiting for other player...');
                }
            } else if(stage === 5){
                console.log('receive second answer');
                triggerHost();
            } else if(stage === 6){
                console.log('check answers');
                //Stop timer
                stop();
                $("#gameTimer").text("Next round about to begin!");
                setTimeout(startTrivia, 1000 * 3);
            } else if(stage === 7){
                //If 15 answers not completed, reset to stage 1
                if(total_answer != 15){
                    gameData.targetStage = 0;
                }
                triggerHost();
            } else if(stage === 8){
                console.log('Game over');
                $("#question").text("Game over!");
                stop();
            }
        }
    }
}); 

playersTree.on("value", function(snapshot) {
    console.log('playersTree');
    currentPlayers = snapshot.numChildren();
    
    playerOneOnline = snapshot.child("1").exists();
    playerTwoOnline = snapshot.child("2").exists();
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();
    
    if (currentPlayers === 2 && !gameData.playingGame) {
        gameData.playingGame = true;
        countdown();
        $("#login-switch").hide();
        $("#start-button, #userName").hide();
        $(".welcome").hide();
    } else if (currentPlayers < 2){
        gameData.targetStage = 0;
        gameData.currentStage = 0;
    } else if (playersTree.onDisconnect()) {
        console.log("player was disconnected!");
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

// Get firebase ajax call, add the fetched imagin to DOM
function getfirebase_info(){
    $.ajax({
        url : "https://musicchallenge-86176.firebaseio.com/.json",
        method : "GET"
    }).done(function(response){
        if (response.players.length === 2){
            $("#player1-image").attr("src",response.players[1].img);
            console.log("this is 1");
        }
        else if (response.players.length ===3){
            $("#player1-image").attr("src",response.players[1].img);
            $("#player2-image").attr("src",response.players[2].img);
            console.log("this is 2");
        }             
    })
}

playersTree.on('child_added',getfirebase_info);

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
            $("#login-switch").hide();
            $(".jumbotron, video").slideUp(1000);
            $(".welcome").show();
            //Call hostUpdate to reset Firebase to default values
            hostUpdate();
        }
        playerTree = database.ref("/players/" + playerNum);

        playerTree.set({
            name: username,
            wins: 0,
            losses: 0,
            img : img_url
        });

        playerTree.onDisconnect().remove();

        $(".youArePlayer").html("<h2> Hello " + username + " you are player " + playerNum + "</h2>");
    } else {
        alert("NO MORE SPACE");
    }
};

// Action after player 2 signs in and clicks "enter" - only runs once
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
    console.log('start trivia')
    timer = 15;
    intervalID = setInterval(decrement2, 1000);
    $("#question").text("What year was this video released?");
    $("#gameTimer").text("You have:" + (" ") + timer + (" ") + "seconds");
    $("#timer").hide();
    $(".answerPlaceholder").remove();
    $(".answer, .score, #player").show();

    //With 2 players, trigger hostUpdate() to start game stage advancing
    gameData.clickedAnswer = false;
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
        gameInfo.update({
            gameStage: gameData.targetStage
        });

        $("#gameTimer").text("Time's up!");
        //Moved setTimeout into game staging
        //setTimeout(startTrivia, 1000 * 3);
    }
}

function stop() {
    console.log('stop');
    clearInterval(intervalID);
}

function capitalize(name){
    return name.charAt(0).toUpperCase()+ name.slice(1);
 }

$("#userName").keypress(function(e){
    if(e.keyCode === 13 && $("#username").val()!==""){
        username = capitalize($("#userName").val().trim())
        $(".jumbotron, video").slideUp(1000);
        $(".welcome").show();
        enterGame();
    }
});

$(".answer").on("click", function() {
    if(!gameData.clickedAnswer){
        gameData.clickedAnswer = true;
        stop();

        //Force a single stage update
        gameData.targetStage++;
        gameInfo.update({
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