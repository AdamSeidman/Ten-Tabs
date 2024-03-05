const GameStates = {
    IDLE: 0,
    PLAYING: 1,
    OVER: 2,
    SETUP: 3,
    ERROR: 4
};

const MAX_TABS = 10;
const DEFAULT_VIDEO_ID = 'f8mL0_4GeV0';

var Game = {
    state: GameStates.IDLE,
    elements: {
        tag: document.createElement('script'),
        firstScriptTag: null,
        introWrapper: document.getElementsByClassName('introWrapper')[0],
        gameplayWrapper: document.getElementsByClassName('gameplayWrapper')[0],
        results: document.getElementById('foundVideos'),
        gameplayInput: document.getElementById('gameplayInput'),
        timerEl: document.getElementById('timer'),
        tagInput: document.getElementById('tagInput'),
        gameplayInfo: document.getElementById('gameplayInfo'),
        gameLoadBtn: document.getElementById('gameLoadBtn'),
        altInputText: document.getElementById('altInputText')
    },
    players: [],
    unmuteAll: () => {
        if (Game.players.length !== MAX_TABS) return;
        Game.players.forEach(x => {
            x.unMute();
        })
    },
    muteAll: () => {
        if (Game.players !== MAX_TABS) return;
        Game.players.forEach(x => {
            x.mute();
        });
    },
    stopAllVideos: () => {
        if (Game.players !== MAX_TABS) return;
        Game.players.forEach(x => {
            x.stopVideo();
        });
    },
    titles: {},
    data: {
        playerThreadsRunning: 0,
        timerRunning: false,
        timerDate: null,
        timerInterval: null,
        difficulty: 0.5,
        apiLoaded: false,
        videosLoaded: 0,
        videoError: false,
        guesses: 0
    },
    startTimer: () => {
        if (Game.data.timerRunning) {
            return false;
        }
        Game.data.timerRunning = true;
        Game.elements.timerEl.innerHTML = '00:00';
        Game.data.timerDate = new Date().getTime();
        Game.data.timerInterval = setInterval(() => {
            let distance = new Date().getTime() - Game.data.timerDate;
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            var minutes = Math.floor(distance / (1000 * 60));
            Game.elements.timerEl.innerHTML = `${minutes < 10? 0 : ''}${minutes}:${seconds < 10? 0 : ''}${seconds}${minutes > 99? '&nbsp;' : ''}`;
        }, 1000);
        return true;
    },
    stopTimer: () => {
        if (!Game.data.timerRunning) {
            return false;
        }
        clearInterval(Game.data.timerInterval);
        Game.data.timerInterval = null;
        Game.data.timerRunning = false;
        Game.data.timerDate = null;
        return true;
    },
    victory: () => {
        if (Game.state !== GameStates.PLAYING) {
            return null;
        }
        Game.elements.timerEl.classList.add('victory');
        Game.stopTimer();
        Game.state = GameStates.OVER;
        setTimeout(() => alert('You win!'), 50);
    },
    setDifficulty: difficulty => {
        if (typeof difficulty != 'number') {
            return false;
        }
        Game.data.difficulty = difficulty;
        return Game.data.difficulty;
    },
    makeGuess: str => {
        if (getSimilarity === undefined) {
            console.error('Function getSimilarity() is undefined!');
            return;
        }
        Game.data.guesses += 1;
        for (let i = 0; i < MAX_TABS; i++) {
            if (Game.titles[`x${i}`] !== undefined && getSimilarity(str, Game.titles[`x${i}`]) >= Game.data.difficulty) {
                let el = document.createElement('li');
                let author = Game.players[i].playerInfo.videoData.author;
                author = (author == undefined || author.trim().length == 0)? '' : `- ${author}`;
                el.innerHTML = `${Game.titles[`x${i}`]} ${author}`;
                Game.elements.results.append(el);
                Game.players[i].stopVideo();
                Game.elements.gameplayInput.value = '';
                delete Game.titles[`x${i}`];
                if (Object.keys(Game.titles).length === 0) {
                    Game.elements.gameplayInput.value = '';
                    Game.victory();
                }
                Game.updateGameplayInfo();
                return;
            }
        }
        Game.updateGameplayInfo();
        Game.elements.gameplayInput.value = '';
    },
    loadVideos: arr => {
        if (!Array.isArray(arr)) {
            return false;
        }
        arr.forEach((video, index) => {
            if (index < MAX_TABS) {
                Game.players[index].loadVideoById(video);
                Game.players[index].mute(video);
            }
        });
        return true;
    },
    reset: () => {
        Game.elements.tagInput.classList.add('hidden');
        Game.elements.timerEl.classList.remove('victory');
        Game.elements.introWrapper.classList.toggle('hidden');
        Game.elements.gameplayWrapper.classList.toggle('hidden');
        Game.elements.tagInput.value = '';
        Game.elements.tagInput.classList.remove('hidden');
        Game.elements.gameplayInfo.innerHTML = '0 Guesses / 10 Remaining';
        Game.elements.timerEl.innerHTML = '00:00';
        Game.data.guesses = 0;
    },
    updateGameplayInfo: () => {
        Game.elements.gameplayInfo.innerHTML = `${Game.data.guesses} Guess${Game.data.guesses === 1? '' : 'es'} / ${Object.keys(Game.titles).length} Remaining`;
    }
};

Game.elements.tag.src = "https://youtube.com/iframe_api"
Game.elements.firstScriptTag = document.getElementsByTagName('script')[0];
Game.elements.firstScriptTag.parentNode.insertBefore(Game.elements.tag, Game.elements.firstScriptTag);

function onPlayerStateChange(event) { // TODO
    if (event.data !== 0 || !(Game.state === GameStates.PLAYING)) return;
    event.target.playVideo();
}

function decodeVideoString(arrStr) {
    if (crc32 === undefined) {
        console.error('crc32() was undefined upon entry!');
        return;
    }
    if (typeof arrStr !== 'string') return
    arrStr = arrStr.trim();
    let crc = arrStr.substring(arrStr.lastIndexOf('a') + 1);
    let str = arrStr.substring(1, arrStr.lastIndexOf('a'));

    if (str.length !== (MAX_TABS * 11) || arrStr.indexOf('?') !== 0 || (`${crc32(str)}` != crc)) {
        return []
    }
    arrStr = arrStr.substring(1);
    let results = [];
    for (let i = 0; i < MAX_TABS; i++) {
        let id = '';
        for (let j = 0; j < 11; j++) {
            id = `${id}${arrStr.charAt((MAX_TABS * j) + i)}`;
        }
        results.push(id);
    }
    return results;
}

function onYouTubeIframeAPIReady() {
    for (var i = 0; i < MAX_TABS; i++) {
        Game.players[i] = new YT.Player(`player${i}`, {
            videoId: DEFAULT_VIDEO_ID,
            events: {
                onStateChange: onPlayerStateChange
            }
        })
    }
    Game.data.apiLoaded = true;

    let id = `${window.location.search}`
    if (id.trim().length === 0) {
        return;
    }
    let videos = decodeVideoString(id);
    if (!Array.isArray(videos) || videos.length !== MAX_TABS) {
        alert('The game provided was not valid.');
    } else {
        Game.elements.tagInput.value = id;
        Game.elements.tagInput.classList.add('hidden');
        Game.elements.altInputText.classList.remove('hidden');
    }
}

Game.elements.gameplayInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        Game.makeGuess(Game.elements.gameplayInput.value);
    }
});

function loadVideoTag() {
    Game.data.videosLoaded = 0;
    Game.data.videoError = false;

    if (!Game.data.apiLoaded) {
        alert('Error! Game API has not loaded.');
        return;
    }

    Game.elements.gameLoadBtn.classList.add('wait');
    document.body.classList.add('wait');

    let videos = decodeVideoString(Game.elements.tagInput.value);
    if (videos === undefined || videos.length < MAX_TABS) {
        alert('Could not decode game string.');
        Game.elements.gameLoadBtn.classList.remove('wait');
        document.body.classList.remove('wait');
        return;
    }

    var checkStatus = function (player, index, final) {
        setTimeout(() => {
            let state;
            try {
                state = player.getPlayerState();
            } catch (error) {
                state = 3;
            }
            if (state === undefined || Math.abs(state) !== 1) {
                checkStatus(player, index);
            } else if (final && state !== 1) {
                alert(`Video ${index} is unplayable.`);
                Game.data.videoError = true;
                Game.elements.gameLoadBtn.classList.remove('wait');
                document.body.classList.remove('wait');
            } else if (state === 1) {
                Game.titles[`x${index}`] = player.videoTitle;
                Game.data.videosLoaded += 1;
                console.log(`Found video ${index + 1}.`);
            } else {
                checkStatus(player, index, true);
            }
        }, final? 1500 : 100);
    }

    var masterThread = function () {
        if (Game.data.timerRunning) {
            alert('Logic error in masterThread.');
            Game.elements.gameLoadBtn.classList.remove('wait');
            document.body.classList.remove('wait');
        } else if (Game.data.videosLoaded >= MAX_TABS) {
            console.log('Found all videos. Starting timer.');
            Game.startTimer();
            Game.elements.timerEl.classList.remove('victory');
            Game.elements.introWrapper.classList.toggle('hidden');
            Game.elements.gameplayWrapper.classList.toggle('hidden');
            Game.elements.results.innerHTML = '';
            setTimeout(Game.unmuteAll, 150);
            Game.state = GameStates.PLAYING;
            Game.elements.gameLoadBtn.classList.remove('wait');
            document.body.classList.remove('wait');
        } else if (Game.data.videoError) {
            console.log('Closing master timer thread due to video error.');
            Game.data.videoError = false;
            Game.elements.gameLoadBtn.classList.remove('wait');
            document.body.classList.remove('wait');
        } else {
            console.log('Rescheduling master thread.');
            setTimeout(masterThread, 100);
        }
    }

    var load = function () {
        let foundError = false;
        try {
            Game.loadVideos(videos);
        } catch (error) {
            console.error(error);
            foundError = true;
        }
        if (foundError) {
            setTimeout(load, 200);
        } else {
            Game.players.forEach((x, n) => checkStatus(x, n));
            masterThread();
        }
    }
    load();
}

// ?I9o55fU6J41lb5eaQVVIZlTzwXYDL1t6ad1nt7eBBl55BCuNoKTbSCtzTYcQTwbs4s3iIlWkU9Ysdo7GkBzpk3yKjuZlHvS3_mEo0koMMcc4Uga1395979446
