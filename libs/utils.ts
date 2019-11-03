import request = require('request');
import fs = require('fs');

function getTimestamp() {
    return Math.round(+new Date() / 1000);
}

function setIntervalImmediately(func: Function, interval: number) {
    setTimeout(() => func(), 2 * 1000);
    return setInterval(func, interval);
}

function getBufferFromImageURL(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        request(url, { encoding: null }, (err, res, body) => {
            if (err) reject(err);
            if (!body) reject(res.statusCode);
            resolve(body);
        });
    });
}
function replaceAll(text: string, search: string, replacement: string) {
    return text.replace(new RegExp(search, 'g'), replacement);
};

function randomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export = {
    getTimestamp: getTimestamp,
    setIntervalImmediately: setIntervalImmediately,
    getBufferFromImageURL: getBufferFromImageURL,
    replaceAll: replaceAll,
    randomString: randomString
}