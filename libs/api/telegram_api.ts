import request = require('request');
import queryString = require('query-string');

let API_GATEWAY = 'https://api.telegram.org';

interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
    error_code?: number;
}

export = class TelegramAPI {
    private readonly token: string;

    private call(method: string, data: any) {
        return new Promise((resolve, reject) => {
            request(`${API_GATEWAY}/bot${this.token}/${method}?${queryString.stringify(data)}`, { json: true }, (err, res, body: TelegramResponse) => {
                console.log('Telegram call result: ${res}');
                if (!res) reject('Не достучались до Telegram. Скорее-всего, Ваш провайдер их блокирует');
                else if (err) reject(`Ошибка при обращении к Telegram API ${err}`);
                else if (!body) reject('Не достучались до Telegram. Скорее-всего, Ваш провайдер их блокирует');
                else if (!body.ok) reject('Body not ok ${body.description}');
                else resolve(body.result);
            });
        });
    }

    sendMessage(text: string, chatID: string) {
        /* todo: сделать это нормальным
        Моё решение слишком тучное и глупое. 
        Задача: найти хэштеги и добавить им ведущий слеш, чтобы парсер игнорировал хэштэги. 
        Слеш нужно добавить перед всеми _ и * в хэштеге. 
        Идеальное вариант решения: написать правильное регулярное выражение, в котором будут группы. 
        Нужно разделить символы и в replace для каждой использовать $1, $2... и заменить это на \\$.
        */
        chatID = '@' + chatID.replace('@', '');
        return new Promise((resolve, reject) => {
            let hashTags = text.match(new RegExp('(?:\s|^)?#[A-Za-z0-9\-\.\_]+(?:\s|$)', 'gi'));
            let fixedHashTags = hashTags
                .map(tag => tag
                    .replace(new RegExp('_', 'g'), '\\_')
                    .replace(new RegExp('*', 'g'), '\\*')
                );

            this.call('sendMessage', {
                chat_id: chatID, text: text
                    .split(' ')
                    .map(word => { if (hashTags.includes(word)) return fixedHashTags[hashTags.indexOf(word)]; else return word; })
                    .join(' '), parse_mode: 'Markdown'
            })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending message to chat ${err}`));
        });
    }

    sendPhoto(url: string, chatID: string) {
        chatID = '@' + chatID.replace('@', '');
        return new Promise((resolve, reject) => {
            this.call('sendPhoto', { chat_id: chatID, photo: url })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending photo to chat ${err}`));
        });
    }

    sendAudio(url: string, chatID: string) {
        chatID = '@' + chatID.replace('@', '');
        return new Promise((resolve, reject) => {
            this.call('sendAudio', { chat_id: chatID, audio: url })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending audio to chat ${err}`));
        });
    }

    sendVideo(ownerID: number, id: number, accessKey: string, chatID: string) {
        chatID = '@' + chatID.replace('@', '');
        return new Promise((resolve, reject) => {
            this.sendMessage(`https://vk.com/video?z=video${ownerID}_${id}&access_key=${accessKey}`, chatID)
                .then(data => resolve(data))
                .catch(err => reject(`Error sending video to chat ${err}`));
        });
    }

    sendDocument(url: string, access_key: string, chatID: string) {
        chatID = '@' + chatID.replace('@', '');
        return new Promise((resolve, reject) => {
            this.call('sendDocument', { chat_id: chatID, document: `${url}&access_key=${access_key}` })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending document to telegram chat ${err}`));
        });
    }

    constructor(token: string) {
        this.token = token;
    }
}
