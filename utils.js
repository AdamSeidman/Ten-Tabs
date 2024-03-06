function shakeElement(el) {
    if (el === undefined) return;
    el.classList.add('shake');
    setTimeout(() => {
        el.classList.remove('shake');
    }, 1000);
}

const pastaMap = {
    close: '🟨',
    closer: '🟧',
    wrong: '⬛',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣',
    '10': '0️⃣'
};

var generateCopyPasta = function(arr) {
    if (arr === undefined || !Array.isArray(arr) || crc32 === undefined) {
        return;
    }
    let result = `Ten Tabs | ${crc32(arr[0])}\n${arr[1]}/${arr[2]}/${arr[3]} (${arr[4]})`;
    while (arr[5].length > 0) {
        let str = (arr[5].length >= 10)? arr[5].substring(0, 10) : arr[5];
        arr[5].length = (arr[5].length === str.length)? '' : arr[5].substring(str.length);
        result = `${result}\n${str}`;
    }
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
