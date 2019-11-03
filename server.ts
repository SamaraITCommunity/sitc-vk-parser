// Сторонние либы
import Discord = require('discord.js');
import request = require('request');
import moment = require('moment');

// Какой-то агли код
import VKParser = require('./libs/api/vk_api');
import { VKPost, VKPhoto, VKAudio, VKVideo, VKDoc, VKPodcast, VKLink } from './interfaces';
import TelegramAPI = require('./libs/api/telegram_api');
import utils = require('./libs/utils');
import config = require('./config');

let discord = new Discord.Client();
let vk_parser = new VKParser({ token: config.VK_API_KEY, groupID: config.VK_GROUP_ID });
let telegram = new TelegramAPI(config.TELEGRAM_API_KEY);

discord.on('ready', () => {
    console.log(`Дискорд бот работает на аккаунте ${discord.user.tag}!`);
});
discord.login(config.DISCORD_API_KEY);

vk_parser.ee.on('ready', () => console.log('Начали слушать группу в ВК'));
vk_parser.ee.on('error', err => console.error(`Произошла ошибка! Ошибка: ${err}`));
vk_parser.ee.on('newPost', (post: VKPost) => {
    let channel = discord.guilds.first().channels.find(channel => channel.name == config.DISCORD_CHANNEL_NAME) as Discord.TextChannel;
    if (post.text) {
        let tgText = utils.replaceAll(post.text, '@samara_it_community', '');
        let check = tgText.match(/\S*\|[^|]*\]/g);

        if (check) check.forEach(reg => {
            let url = reg.replace('[', '').replace(']', '').split('|')[0];
            let desc = reg.replace('[', '').replace(']', '').split('|')[1];
            tgText = tgText.replace(reg, `[${desc}](https://vk.com/${url})`);
        });
        telegram.sendMessage(tgText, config.TELEGRAM_CHANNEL_ID)
            .catch(err => console.error(`Произошла ошибка! Ошибка: ${err}`));

        let discordText = utils.replaceAll(post.text, '@samara_it_community', '');
        if (check) check.forEach(reg => {
            let url = reg.replace('[', '').replace(']', '').split('|')[0];
            discordText = discordText.replace(reg, `https://vk.com/${url}`);
        });
        channel.send(discordText);
    }
    if (post.attachments) {
        post.attachments.filter(a => a.type == 'link').forEach((attach: VKLink) => {
            if (attach.link.button.title == 'Читать') {
                telegram.sendMessage(`Статья "${attach.link.title}". Читать - [нажмите на ссылку](${attach.link.url})`, config.TELEGRAM_CHANNEL_ID)
                    .catch(err => console.error(`Произошла ошибка при отправке статьи! Ошибка: ${err}`));
                channel.send('', { embed: { title: attach.link.title, description: `Новая статья в группе ВК. Читать - [нажмите на ссылку](${attach.link.url})`, image: { url: attach.link.photo.sizes[attach.link.photo.sizes.length - 1].url } } })
                    .catch(err => console.error(`Произошла ошибка при отправке статьи в Discord! Ошибка: ${err}`));
            }
        });
        post.attachments.filter(a => a.type == 'photo').forEach((attach: VKPhoto) => {
            let url = attach.photo.sizes[attach.photo.sizes.length - 1].url;
            telegram.sendPhoto(url, config.TELEGRAM_CHANNEL_ID)
                .catch(err => console.error(`Произошла ошибка при отправке фото! Ошибка: ${err}`));
            channel.send('', { file: url });
        });
        post.attachments.filter(a => a.type == 'video').forEach((attach: VKVideo) => {
            telegram.sendVideo(attach.video.owner_id, attach.video.id, attach.video.access_key, config.TELEGRAM_CHANNEL_ID)
                .catch(err => console.error(`Произошла ошибка при отправке видео! Ошибка: ${err}`));
            channel.send(`Видео: https://vk.com/video?z=video${attach.video.owner_id}_${attach.video.id}&access_key=${attach.video.access_key}`);
        });
        post.attachments.filter(a => a.type == 'podcast').forEach((attach: VKPodcast) => {
            telegram.sendMessage(`Подкаст: ${attach.podcast.url}&access_key=${attach.podcast.access_key}`, config.TELEGRAM_CHANNEL_ID)
                .catch(err => console.error(`Произошла ошибка при отправке подкаста! Ошибка: ${err}`));

            channel.send(`Подкаст: ${attach.podcast.url}?${attach.podcast.access_key}`)
                .catch(err => console.error(`Произошла ошибка при отправке сообщения в Discord! Ошибка: ${err}`));
        });
        post.attachments.filter(a => a.type == 'audio').forEach((attach: VKAudio) => {
            telegram.sendAudio(attach.audio.url, config.TELEGRAM_CHANNEL_ID)
                .catch(err => console.error(`Произошла ошибка при отправке аудио! Ошибка: ${err}`));

            channel.send('', { file: attach.audio.url.split('.mp3')[0] + '.mp3' })
                .catch(err => console.error(`Произошла ошибка при отправке сообщения в Discord! Ошибка: ${err}`));
        });
        post.attachments.filter(a => a.type == 'doc').forEach((attach: VKDoc) => {
            telegram.sendDocument(attach.doc.url, attach.doc.access_key, config.TELEGRAM_CHANNEL_ID)
                .catch(err => console.error(`Произошла ошибка при отправке документа (${attach.doc.url})! Ошибка: ${err}`));

            channel.send('', { file: `${attach.doc.url}&access_key=${attach.doc.access_key}` })
                .catch(err => console.error(`Произошла ошибка при отправке сообщения в Discord! Ошибка: ${err}`));
        });
    }

    let gitText = utils.replaceAll(post.text, '@samara_it_community', '');
    let check = gitText.match(/\S*\|[^|]*\]/g);
    if (check) check.forEach(reg => {
        let url = reg.replace('[', '').replace(']', '').split('|')[0];
        let desc = reg.replace('[', '').replace(']', '').split('|')[1];
        gitText = gitText.replace(reg, `[${desc}](https://vk.com/${url})`);
    });
    let date = new Date();
    let id = utils.randomString(16);
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
                    `+++ title = "${gitText ? gitText.split('\n')[0] : `${id}.md`}" date = ${moment(date).format('YYYY-MM-DD')} description = "${gitText ? gitText.slice(0, 25) : 'Описание отсутствует'}..." +++\n\n${post.attachments.filter(a => a.type == 'photo').map((p: VKPhoto) => `\n\n![Alt](${p.photo.sizes[p.photo.sizes.length - 1].url})`)}`).toString('base64')
        }
    }, (err, _, __) => {
        if (err) console.error(err);
    });
});