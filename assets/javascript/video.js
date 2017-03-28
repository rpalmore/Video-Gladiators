//Author: Matthew Sells
//YouTube Data API key  AIzaSyApk9cJ6LxO_taHUxiG8kftlhs1ilr7LpQ

//Base query URL: https://www.googleapis.com/youtube/v3/search?
//Reference: https://developers.google.com/youtube/v3/docs/search/list

//Variables specific to player so as not to pollute global scope
var videoPlayer = {
	//API key
	key: 'AIzaSyApk9cJ6LxO_taHUxiG8kftlhs1ilr7LpQ',
	//Id of the YouTube playlist to use
	playlistId: 'PL30BFB50685A0252B',
	//List will be populated with YouTube video IDs on page load
	videoList: []
}

//				<---------------------------->
//Following functions are YouTube requirements for video playing

//This will hold the player in the DOM. I think it needs to be in the global scope
var player;
var done = false;

//When video is loaded, play it
function onPlayerReady(event) {
	event.target.playVideo();
}

//If the video is done playing, stop the video motion
function onPlayerStateChange(event) {
	if(event.data == 0){
		videoOver();
	}
}

//Initialize the YouTube player
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '390',
		width: '640',
		videoId: '',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

//End YouTube inclusive functions
//				<---------------------------->

function loadVideos(){
	//See how many items are in the playlist.
	//You have to look at playlist info because you need 'next page token' to continue past 50
	var queryURL = 'https://www.googleapis.com/youtube/v3/playlists';
	queryURL += '?key=' + videoPlayer.key;
	queryURL += '&part=contentDetails&id='+videoPlayer.playlistId;

	var items;

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).done(function(response){
		items = response.items[0].contentDetails.itemCount;
	});

	//Now that number of items are known, add the individual items to the videoList array in videoPlayer
	queryURL = 'https://www.googleapis.com/youtube/v3/playlistItems';
	queryURL += '?key=' + videoPlayer.key;
	queryURL += '&part=contentDetails&playlistId='+videoPlayer.playlistId+'&maxResults=50';

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).done(function(response){
		//Load each video into the videoList array
		for(var i = 0; i < items; i++){
			//For now, cut at 50 (page item limit for YouTube response)
			if(i === 50){
				break;
			}
			videoPlayer.videoList.push(response.items[i].contentDetails.videoId);
		}
	});
}

//Returns video ID of video stored in videoPlayer.videoList
function selectRandomVideo(){
	var num = Math.floor(Math.random()*videoPlayer.videoList.length);
	return videoPlayer.videoList[num];
}

//Load a video into the player and start playing
function playVideoById(vidId){
	done = false;
	player.loadVideoById(vidId);
	player.playVideo();
}

//Stop the video playback
function stopVideo() {
	player.stopVideo();
}

//This will run when the video finishes. Maybe replace the video with an image or something?
function videoOver(){
	console.log('video has finished playing');
}

//Returns the year the video was uploaded
function getVideoYear(vidId){
	var queryURL = 'https://www.googleapis.com/youtube/v3/videos';
	queryURL += '?key=' + videoPlayer.key;
	queryURL += '&part=snippet&id='+vidId;

	var year;

	$.ajax({
		url: queryURL,
		method: 'GET'
	}).done(function(response){
		year = response.items[0].snippet.publishedAt;
		year = parseInt(year.substr(0, 4));
		gameData.correctAnswer = year;
	});
}

//For testing
function playbtn(){
	var vidId = selectRandomVideo();
	playVideoById(vidId);
}

$(document).ready(function(){
	$('#play-song').on('click', playbtn);
	loadVideos();
});

loadVideos();