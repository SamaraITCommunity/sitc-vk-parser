import request = require('request');
import { db, discord, telegram } from '../server';
import { VKPost, VKPhoto, Task } from '../interfaces';
import config from '../config';
import Discord = require('discord.js');
import moment from 'moment';

export function getTimestamp() {
    return Math.round(+new Date() / 1000);
}

export function setIntervalImmediately(func: Function, interval: number) {
    setTimeout(() => func(), 2 * 1000);
    return setInterval(func, interval);
}

export function getBufferFromImageURL(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        request(url, { encoding: null }, (err, res, body) => {
            if (err) reject(err);
            if (!body) reject(res.statusCode);
            resolve(body);
        });
    });
}

export function replaceAll(text: string, search: string, replacement: string) {
    return text.replace(new RegExp(search, 'g'), replacement);
};

export function randomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export class QueueManager {
    hasPostInQueue(postID: number) {
        let queue = db.get('queue');
        return !queue.get('tasks').find(t => t.post.id == postID).isUndefined().value();
    }

    retryQueue() {
        let queue = db.get('queue');
        Object.keys(queue.get('tasks').value()).forEach(key => {
            this.handle(queue.get('tasks').get(key).value());
            console.log(`Попытался отправить ${key} ещё раз`);
        });
    }

    addToQueue(social: 'telegram' | 'discord' | 'github', post: VKPost, handleImmediately?: boolean) {
        let queue = db.get('queue');
        let newID = randomString(16);
        queue.get('tasks').set(newID, { id: newID, social: social, post: post }).write();
        if (handleImmediately) this.handle({ id: newID, social: social, post: post });
    }

    handle(task: Task) {
        let queue = db.get('queue');
        if (task.social == 'github') {
            if (!config.GITHUB_API_KEY || !config.GITHUB_REPO_NAME || !config.GITHUB_USERNAME) {
                console.log('Источник "GitHub" не подключен. Пропускаем.');
                queue.get('tasks').unset(task.id).write();
                return;
            }

            let post = task.post;

            let gitText = replaceAll(post.text, '@samara_it_community', '');
            let check = gitText.match(/\S*\|[^|]*\]/g);
            if (check) check.forEach(reg => {
                let url = reg.replace('[', '').replace(']', '').split('|')[0];
                let desc = reg.replace('[', '').replace(']', '').split('|')[1];
                gitText = gitText.replace(reg, `[${desc}](https://vk.com/${url})`);
            });
            let date = new Date();
            let id = randomString(16);

            let photos = '';
            if (post.attachments) if (post.attachments.length > 0) photos = post.attachments.filter(a => a.type == 'photo').map((p: VKPhoto) => `\n\n![Alt](${p.photo.sizes[p.photo.sizes.length - 1].url})`).join('');
            request.put(`https://api.github.com/repos/${config.GITHUB_USERNAME}/${config.GITHUB_REPO_NAME}/contents/content/${id}.md`, {
                json: true,
                headers: {
                    'User-Agent': config.GITHUB_USERNAME,
                    Authorization: `token ${config.GITHUB_API_KEY}`
                },
                body: {
                    message: `Новый пост - ${id}.md`,
                    content:
                        Buffer.from(
                            config.text.github.TEMPLATE
                                .replace(new RegExp('%title%', 'g'), `${gitText ? gitText.split('\n')[0] : `${id}.md`}`)
                                .replace(new RegExp('\%date\.([^\s]+)\%', 'g'), moment(date).format('YYYY-MM-DD'))
                                .replace(new RegExp('%description%', 'g'), gitText ?
                                    gitText.slice(0, 25) + (gitText.length > 25 ? '...' : '')
                                    : config.text.github.NO_DESCRIPTION)
                                .replace(new RegExp('%photos%', 'g'), photos)
                        ).toString('base64')
                }
            }, (err, res, __) => {
                if (!res) console.error('Ошибка при аплоуде на GitHub');
                else if (err) console.error('Ошибка при аплоуде на GitHub');
                else queue.get('tasks').unset(task.id).write();
            });
        }

        if (task.social == 'telegram') {
            if (!config.TELEGRAM_API_KEY || !config.TELEGRAM_CHANNEL_ID) {
                console.log('Источник "Telegram" не подключен. Пропускаем.');
                queue.get('tasks').unset(task.id).write();
                return;
            }

            let promiseList = new Array<Promise<any>>();

            let post = task.post;
            if (post.text) {
                let tgText = replaceAll(post.text, '@samara_it_community', '');
                let check = tgText.match(/\S*\|[^|]*\]/g);

                if (check) check.forEach(reg => {
                    let url = reg.replace('[', '').replace(']', '').split('|')[0];
                    let desc = reg.replace('[', '').replace(']', '').split('|')[1];
                    tgText = tgText.replace(reg, `[${desc}](https://vk.com/${url})`);
                });
                console.log(`Going to send message: ${tgText} to channel: ${config.TELEGRAM_CHANNEL_ID}`);
                promiseList.push(telegram.sendMessage(tgText, config.TELEGRAM_CHANNEL_ID));
            }

            if (post.attachments) {
                post.attachments.forEach(attach => {
                    switch (attach.type) {
                        case 'link':
                            if (!attach.link.button) promiseList.push(telegram.sendMessage(`Ссылка: "${attach.link.url}". Подробнее - [нажмите на ссылку](${attach.link.url})`, config.TELEGRAM_CHANNEL_ID));
                            else if (attach.link.button.title == 'Читать') {
                                promiseList.push(telegram.sendMessage(`Статья "${attach.link.title}". Читать - [нажмите на ссылку](${attach.link.url})`, config.TELEGRAM_CHANNEL_ID));
                            }
                            break;
                        case 'photo':
                            let url = attach.photo.sizes[attach.photo.sizes.length - 1].url;
                            promiseList.push(telegram.sendPhoto(url, config.TELEGRAM_CHANNEL_ID));
                        case 'video':
                            promiseList.push(telegram.sendVideo(attach.video.owner_id, attach.video.id, attach.video.access_key, config.TELEGRAM_CHANNEL_ID));
                        case 'podcast':
                            promiseList.push(telegram.sendMessage(`Подкаст: ${attach.podcast.url}&access_key=${attach.podcast.access_key}`, config.TELEGRAM_CHANNEL_ID));
                        case 'audio':
                            promiseList.push(telegram.sendAudio(attach.audio.url, config.TELEGRAM_CHANNEL_ID));
                        case 'doc':
                            promiseList.push(telegram.sendDocument(attach.doc.url, attach.doc.access_key, config.TELEGRAM_CHANNEL_ID));
                        default:
                            break;
                    }
                });
            }

            Promise.all(promiseList)
                .then(() => queue.get('tasks').unset(task.id).write())
                .catch(err => console.error(`Произошла ошибка при интеракции с Telegram. Ошибка: ${err}`));
        }

        if (task.social == 'discord') {
            if (!config.DISCORD_ADMIN_ROLE || !config.DISCORD_API_KEY || !config.DISCORD_CHANNEL_NAME) {
                console.log('Источник "Discord" не подключен. Пропускаем.');
                queue.get('tasks').unset(task.id).write();
                return;
            }

            let promiseList = new Array<Promise<any>>();

            let channel = discord.guilds.first().channels.find(channel => channel.name == config.DISCORD_CHANNEL_NAME) as Discord.TextChannel;
            let post = task.post;
            if (!channel) {
                console.log(`Failed to find channel: ${config.DISCORD_CHANNEL_NAME}`);
            }
            if (post.text && channel) {
                console.log(`Going to post ${JSON.stringify(post)} to a channel ${JSON.stringify(channel)}`);
                let discordText = replaceAll(post.text, '@samara_it_community', '');
                let check = discordText.match(/\S*\|[^|]*\]/g);

                if (check) check.forEach(reg => {
                    let url = reg.replace('[', '').replace(']', '').split('|')[0];
                    discordText = discordText.replace(reg, `https://vk.com/${url}`);
                });
                promiseList.push(channel.send(discordText));
            }

            if (post.attachments && channel) {
                post.attachments.forEach(attach => {
                    switch (attach.type) {
                        case 'link':
                            if (attach.link.button.title == 'Читать') promiseList.push(
                                channel.send('', { embed: { title: attach.link.title, description: `Новая статья в группе ВК. Читать - [нажмите на ссылку](${attach.link.url})`, image: { url: attach.link.photo.sizes[attach.link.photo.sizes.length - 1].url } } })
                            );
                            break;
                        case 'photo':
                            let url = attach.photo.sizes[attach.photo.sizes.length - 1].url;
                            promiseList.push(channel.send('', { file: url }));
                        case 'video':
                            promiseList.push(channel.send(`Видео: https://vk.com/video?z=video${attach.video.owner_id}_${attach.video.id}&access_key=${attach.video.access_key}`));
                        case 'podcast':
                            promiseList.push(channel.send(`Подкаст: ${attach.podcast.url}?${attach.podcast.access_key}`));
                        case 'audio':
                            promiseList.push(channel.send('', { file: attach.audio.url.split('.mp3')[0] + '.mp3' }));
                        case 'doc':
                            promiseList.push(channel.send('', { file: `${attach.doc.url}&access_key=${attach.doc.access_key}` }));
                        default:
                            break;
                    }
                });
            }

            Promise.all(promiseList)
                .then(() => queue.get('tasks').unset(task.id).write())
                .catch(err => console.error(`Произошла ошибка при отправке сообщения в Discord! Ошибка: ${err}`));
        }
    }

    constructor() { }
}
