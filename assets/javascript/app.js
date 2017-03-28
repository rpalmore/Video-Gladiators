// var config = {
//     apiKey: "AIzaSyDyjAZ5RiWX0Pt5dkiMEJ_tXbY1Z7M63Uc",
//     authDomain: "musicchallenge-86176.firebaseapp.com",
//     databaseURL: "https://musicchallenge-86176.firebaseio.com",
//     storageBucket: "musicchallenge-86176.appspot.com",
//     messagingSenderId: "666483398318"
//   };
  

// firebase.initializeApp(config);

// var database = firebase.database();
// var playersTree = database.ref("players");
// var currentPlayers = null;
// var username = "User";
// var playerOneOnline = false;
// var playerTwoOnline = false;
// var playerOneData = null;
// var playerTwoData = null;
// var playerNum = null;
// var total_answer = 0;
// var correct_answer = 0;
// var multipleChoices;


// var generate_multipleChoices = function(correct_answer){
//     multipleChoices = [correct_answer];
//     var index = 0;
//     while (index < 3){
//         var randomNumber = correct_answer + math.randomInt(-10,10);
//         if (multipleChoices.indexOf(randomNumber) === -1){
//             multipleChoices.push(randomNumber);
//             index ++;
//         }
//     }
//     return multipleChoices.sort();
// }

// generate_multipleChoices(1998);


// $("#start-button").click(function() {
//     if ($("#username").val() !== "") {
//         username = capitalize(($("#userName").val().trim()));
//         enterGame();
//     }
// });

$("#userName").keypress(function(e){
    if(e.keyCode === 13 && $("#username").val()!==""){
        username = capitalize($("#userName").val().trim())
        enterGame();
    }
});

// function capitalize(name){
//     return name.charAt(0).toUpperCase()+ name.slice(1);
//  }

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
        $('#myModal').show("block");
    }
};


// playerTree.on("child_added", function(snapshot) {
//  if (currentPlayers === 1) {
//  }
// });

// this function is just listening to what is happeing to the database
// similar to the rps game have an online counter to determ player number
playersTree.on("value", function(snapshot) {

    // scoreBoard();

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

//Add button clicks to answer
$(".answer").on("click", function() {
    total_answer ++;
    if ($(this).text().trim()==1998){
       correct_answer ++;
       playerTree.update({
        wins: correct_answer,
        losses: total_answer - correct_answer
       })
    }
    else{
        playerTree.update({
            wins:correct_answer,
            losses:total_answer - correct_answer
        })
    }
});
	
// var AddChoice_to_DOM =  function(){
// 	$("#answer1").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[0]);
// 	$("#answer2").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[1]);
// 	$("#answer3").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[2]);
// 	$("#answer4").html("<i class='fa fa-circle-o fa-1.5x' aria-hidden='true'></i>" + multipleChoices[3]);
// }