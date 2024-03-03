var tag = document.createElement('script');
tag.src = "https://youtube.com/iframe_api"
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = [];

function onYouTubeIframeAPIReady() {
    for (var i = 0; i < 10; i++) {
        players[i] = createPlayer(i);
    }
}

function createPlayer(num) {
    return new YT.Player(`player${num}`, {
        videoId: 'f8mL0_4GeV0'
    });
}

function unmuteAll() {
    players.forEach(x => {
        x.unMute();
    });
}

function muteAll() {
    players.forEach(x => {
        x.mute();
    });
}

function addVideoString(arrStr) {
    arrStr = arrStr.trim();
    let crc = arrStr.substring(arrStr.lastIndexOf('a') + 1)
    let str = arrStr.substring(1, arrStr.lastIndexOf('a'))

    if (str.length !== 110 || arrStr.indexOf('?') !== 0 || (`${crc32(str)}` != crc)) {
        alert('Video string was not valid.');
        return false;
    }
    arrStr = arrStr.substring(1);
    for (let i = 0; i < 10; i++) {
        let id = ''
        for (let j = 0; j < 11; j++) {
            id = `${id}${arrStr.charAt((10 * j) + i)}`;
        }
        players[i].loadVideoById(id);
        players[i].mute();
    }
    return true;
}

function stopAllVideos() {
    players.forEach(x => {
        x.stopVideo();
    });
}

var titles = {};
var videosFound = 0;
var videoError = false;
var timerRunning = false;

function finalErrorcheck(player, index) {
    setTimeout(() => {
        if (player.getPlayerState() === -1) {
            alert(`Video ${index} is unplayable.`);
            videoError = true;
        } else {
            titles[`x${index}`] = player.videoTitle;
            videosFound += 1;
            console.log('found a video');
        }
    }, 500);
}

function checkVideoStatus(player, index) {
    setTimeout(() => {
        let state = player.getPlayerState();
        if (state === undefined || Math.abs(state) !== 1)
        {
            checkVideoStatus(player, index);
        }
        else if (state === -1)
        {
            console.log('trying');
            finalErrorcheck(player, index);
        }
        else
        {
            titles[`x${index}`] = player.videoTitle;
            videosFound += 1;
            console.log('found a video');
        }
    }, 100);
}

const introWrapper = document.getElementsByClassName('introWrapper')[0];
const gameplayWrapper = document.getElementsByClassName('gameplayWrapper')[0];
const results = document.getElementById('foundVideos');
const gameplayInput = document.getElementById('gameplayInput');

function makeGuess() {
    for (let i = 0; i < 10; i++) {
        if (titles[`x${i}`] !== undefined && getSimilarity(gameplayInput.value, titles[`x${i}`]) >= 0.5) {
            let el = document.createElement('li');
            let author = players[i].playerInfo.videoData.author;
            author = (author == undefined || author.trim().length == 0)? '' : `- ${author}`;
            el.innerHTML = `${titles[`x${i}`]} ${players[i].playerInfo.videoData.author}`; // TODO please minify the file
            results.appendChild(el);
            players[i].stopVideo();
            gameplayInput.value = '';
            delete titles[`x${i}`];
            if (Object.keys(titles).length === 0) {
                stopTimer();
                alert('You win!');
            }
            return;
        }
    }
    gameplayInput.value = '';
}

gameplayInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

function startGameMasterInit() {
    setTimeout(() => {
        if (timerRunning) {
            console.error('Logic error.');
        }
        else if (videosFound >= 10) {
            console.log('Starting timer.');
            videosFound = 0;
            startTimer();
            introWrapper.classList.toggle('hidden');
            gameplayWrapper.classList.toggle('hidden');
            results.innerHTML = '';

            // enable game // TODO
            // setTimeout for resuming all
        } else if (videoError) {
            console.log('Closing master timer thread.');
            videoError = false;
        } else {
            startGameMasterInit();
            console.log('Rescheduling timer start.')
        }
    }, 100);
}

var tagInput = document.getElementById('tagInput');
function loadVideoTag() {
    videosFound = 0;
    addVideoString(tagInput.value);
    players.forEach((x, n) => checkVideoStatus(x, n));
    startGameMasterInit();
    //setTimeout(unmuteAll, 2000); // TODO remove?
}

var timerEl = document.getElementById('timer');
var timerDate = null;
var timerInterval = null;

function startTimer() {
    if (timerRunning) {
        return false;
    }
    timerRunning = true;
    timerEl.innerHTML = '00:00';
    timerDate = new Date().getTime();
    timerInterval = setInterval(() => {
        let distance = new Date().getTime() - timerDate;
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var minutes = Math.floor(distance / (1000 * 60));
        timerEl.innerHTML = `${minutes < 10? 0 : ''}${minutes}:${seconds < 10? 0 : ''}${seconds}${minutes > 99? '&nbsp;' : ''}`;
    }, 1000);
    return true;
}

function stopTimer() {
    if (!timerRunning) {
        return false;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    timerDate = null;
    return true;
}

// ?JU6f55o9IQVQVae5bl15LYDXwzTlZlet7n1da6tlouNCB55lB7cTYztCSbTEI3is4sbwTT7dosY9UkWMjyK3kpzBkOE_m3SvHlZxUc4cMMok0sa1348518886
// ?I9o55fU6J41lb5eaQVVIZlTzwXYDL1t6ad1nt7eBBl55BCuNoKTbSCtzTYcQTwbs4s3iIlWkU9Ysdo7GkBzpk3yKjuZlHvS3_mEo0koMMcc4Uga1395979446
