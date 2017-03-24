var timer = 15;
var intervalID;

$(".main").hide();
$(".row").hide();

// Need to add interstitial here for "waiting" player
// What happens after they click "enter"?

function startGame() {
    $("#start-button").on("click", function() {
    $("#start-button").hide();
    $(".jumbotron").slideUp();
    $("#userName").hide();
    $(".main").show();
    $(".row").hide();
    countdown();
    })
}

startGame();

function countdown() {
    timer = 5;
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
    intervalID = setInterval(decrement, 1000);
    $("#video-placeholder").fadeOut(5000);
    if (timer === 0) {
        stop();
        startTimer();
	}
}


function decrement() {
    timer--;
    $("#timer").text("We will begin the match in:" + (" ") + timer + (" ") + "seconds");
    if (timer === 0) {
        stop();
        setTimeout(startTimer, 1000 * 3);
    }
}

function startTimer() {
    timer = 5;
    intervalID = setInterval(decrement, 1000);
    $("#timer").text("Time is up in:" + (" ") + timer + (" ") + "seconds");
    $("#video-player").show();
    $(".row").show();
}

function stop() {
    clearInterval(intervalID);
}

function revealChoices() {

}

function revealAnswer() {
    $("#answer1, #answer2, #answer3").fadeOut(1000);
}
