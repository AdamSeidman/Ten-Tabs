function shakeElement(el) {
    if (el === undefined) return;
    el.classList.add('shake');
    setTimeout(() => {
        el.classList.remove('shake');
    }, 1000);
}

const PastaMap = {
    close: '🟨',
    closer: '🟧',
    wrong: '⬛',
    giveUp: '❌',
    victory: '✅',
    number: '️⃣'
};

var generateCopyPasta = function(arr) {
    if (arr === undefined || !Array.isArray(arr) || crc32 === undefined) {
        return;
    }
    let result = `Ten Tabs | ${crc32(arr[0])}\n${arr[1]}/${arr[2] - arr[3]}/${arr[3]} (${arr[4]})`;
    arr[5].forEach((el, index) => {
        if (index % 8 === 0) {
            result = `${result}\n${el}`;
        } else {
            result += el;
        }
    });
    return result;
}

var copyToClipboard = function(str) {
    if (typeof str !== 'string') {
        return;
    }
    navigator.clipboard.writeText(str);
}

var copyPasta = function(arr) {
    copyToClipboard(generateCopyPasta(arr));
}

var redirectToGenerator = function() {
    window.location.assign("https://seidman-ad.am/Ten-Tabs/Generator/")
}
