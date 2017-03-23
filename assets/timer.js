
var timer = 15;
var intervalID;

function start() {
 	player1Wins = 0;
	player1Losses = 0;
	player2Wins = 0;
	player2Losses = 0;
	$("#start-button").on("click", function() {
	$("#start-button").hide();
	startTimer();
  })
}
start();

function startTimer(){
	timer = 5;
	$("#timer").text("Time remaining:" + (" ") + timer + (" ") + "seconds");
	intervalID = setInterval(decrement, 1000);
	revealQuestions();
}

function decrement() {
	timer--;
	$("#timer").text("Time remaining:" + (" ") + timer + (" ") + "seconds");
	if (timer === 0) {
		stop();
		$("#timer").text("Time's up!!!");
		$("#question").text("The correct answer is:");
		revealAnswer();
		setTimeout(startTimer, 1000 * 3);
}
}

function stop() {
	clearInterval(intervalID);
}

function revealQuestions() {
	
}
function revealAnswer() {
	$("#answer1, #answer2, #answer3").fadeOut(1000);
}