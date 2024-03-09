const textOutput = document.getElementById('textOutput');

const MAX_TABS = 10;

var tag = document.createElement('script');
tag.src = "https://youtube.com/iframe_api"
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = [];

function setRed(index, highlighted) {
    let el = document.getElementsByClassName('linkInput')[index];
    if (highlighted) {
        el.classList.add('red');
    } else {
        el.classList.remove('red');
    }
}

function clearRed() {
    for (let i = 0; i < MAX_TABS; i++) {
        setRed(i, false);
    }
}

function onYouTubeIframeAPIReady() {
    for (var i = 0; i < MAX_TABS; i++) {
        players[i] = createPlayer(i);
    }
}

function createPlayer(num) {
    return new YT.Player(`player${num}`, {
        videoId: 'f8mL0_4GeV0'
    });
}

function isAlphaNumeric(str) {
    var code, i, len, ch;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        ch = str.charAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123) && // lower alpha (a-z)
            (ch !== '-') &&
            (ch !== '_')) {
            return false;
        }
    }
    return true;
}

var copyWrapper = document.getElementById('copyWrapper');
function enableCopyButtons(enabled) {
    if (typeof enabled !== 'boolean') return;
    if (enabled) {
        copyWrapper.classList.remove('hidden');
    } else {
        copyWrapper.classList.add('hidden');
    }
}

function copyUrlToClipboard() {
    navigator.clipboard.writeText(`https://Seidman-Ad.am/Ten-Tabs/${textOutput.innerHTML}`);
    alert('Copied!');
}

function copyStringToClipboard() {
    navigator.clipboard.writeText(textOutput.innerHTML);
    alert('Copied!');
}

var invalidVideos = [];
var processedCount = 0;
var ids = [];

function processId(index) {
    setTimeout(() => {
        let state = players[index].getPlayerState();
        if (state === undefined || Math.abs(state) !== 1) {
            processId(index);
        } else if (state === -1) {
            setTimeout(() => {
                if (players[index].getPlayerState() === -1) {
                    invalidVideos.push(index)
                }
                players[index].stopVideo();
                processedCount += 1;
            }, 750);
        } else {
            players[index].stopVideo();
            processedCount += 1;
        }
    }, 100);
}

function startMasterThread() {
    setTimeout(() => {
        if (processedCount < MAX_TABS) {
            startMasterThread();
        } else if (invalidVideos.length === 1) {
            textOutput.innerHTML = `Video ${invalidVideos[0]} is not playable external to youtube.`;
            setRed(invalidVideos[0] - 1, true);
        } else if (invalidVideos.length > 1) {
            invalidVideos.forEach(x => {
                setRed(x - 1, true);
            });
            invalidVideos.sort();
            invalidVideos = invalidVideos.map(x => x + 1);
            let last = invalidVideos.pop();
            if (invalidVideos.length > 1) {
                invalidVideos[invalidVideos.length - 1] = `${invalidVideos[invalidVideos.length - 1]},`
            }
            textOutput.innerHTML = `Videos ${invalidVideos.join(', ')} & ${last} are not playable external to youtube.`
        } else {
            let text = '';
            for (let i = 0; i < 11; i++) {
                for (let j = 0; j < MAX_TABS; j++) {
                    text = `${text}${ids[j].charAt(i)}`
                }
            }
            textOutput.innerHTML = `?${text}a${crc32(text)}`;
            enableCopyButtons(true);
        }
    }, 100);
}

function startMakeId() {
    let error = false;
    let duplicate = false;
    let blank = false;
    ids = [];
    enableCopyButtons(false);
    clearRed();
    textOutput.innerHTML = 'Working...';
    Array.from(document.getElementsByClassName('linkInput')).forEach((input, index) => {
        input = input.value.trim().replace(/\\/g, "/");
        let valid = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
        if (input.length === 0) {
            error = true;
            blank = true;
            setRed(index, true);
        } else if (valid.test(input)) {
            let str = input.substring(input.lastIndexOf('/') + 1);
            if (str.includes('feature')) {
                str = str.substring(0, str.indexOf('feature') - 1);
            }
            if (str.includes('?fs=')) {
                str = str.substring(0, str.indexOf('?'));
            }
            if (str.includes('?v=')) {
                str = str.substring(str.indexOf('?v=') + 3);
            }
            if (str.includes('?')) {
                str = str.substring(0, str.indexOf('?'));
            }
            str = str.trim();
            if (str.length !== 11 || !isAlphaNumeric(str)) {
                if (str.length > 11 && str.includes('&')) {
                    str = str.substring(0, str.indexOf('&'));
                    if (str.length === 11 && isAlphaNumeric(str)) {
                        ids.push(str);
                    } else {
                        setRed(index, true);
                        error = true;
                    }
                } else {
                    setRed(index, true);
                    error = true;
                }
            } else if (ids.includes(str)) {
                if (index == 0) alert(2);
                setRed(index, true);
                error = true;
                duplicate = true;
            } else {
                ids.push(str);
            }
        } else {
            setRed(index, true);
            error = true;
        }
    })
    if (error) {
        textOutput.innerHTML = blank? 'You must provide ten links.' : (duplicate? 'You cannot have duplicate videos.' : 'Not all of the provided links were valid.');
    } else {
        processedCount = 0;
        invalidVideos = [];
        ids.forEach((x, n) => {
            players[n].loadVideoById(x);
            players[n].mute();
            processId(n);
        });
        startMasterThread();
    }
}
