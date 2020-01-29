require('dotenv').config();
import Discord = require('discord.js');
import VKParser = require('./libs/api/vk_api');
import { VKPost } from './interfaces';
import TelegramAPI = require('./libs/api/telegram_api');
import config from './config';
import { QueueManager, getTimestamp } from './libs/utils';
let queueManager = new QueueManager();

import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
let adapter = new FileSync('db.json');
export let db = low(adapter);
db.defaults({
    queue: {
        tasks: {}
    },
    vk: { lastCheckTime: getTimestamp() }
})
    .write();

export let discord = new Discord.Client();
export let vk_parser = new VKParser({ token: config.VK_API_KEY, groupID: config.VK_GROUP_ID });
export let telegram = new TelegramAPI(config.TELEGRAM_API_KEY);

import fs from 'fs';

discord.on('ready', () => {
    console.log(`Дискорд бот работает на аккаунте ${discord.user.tag}!`);
});
discord.on('message', msg => {
    if (msg.channel.type == 'text' && msg.member.roles.has(config.DISCORD_ADMIN_ROLE) && msg.member.user != discord.user) {
        let args = msg.content.split(' ');
        switch (args[0]) {
            case '$set':
                if (args[1] == 'channel') {
                    if (args[2]) {
                        let newChannel = discord.guilds.first().channels.find(channel => channel.name == args[2]);
                        if (newChannel) {
                            config.DISCORD_CHANNEL_NAME = newChannel.name;
                            fs.writeFileSync('./config.ts', fs.readFileSync('./config.ts', 'utf8').replace(new RegExp('DISCORD_CHANNEL_NAME: \'([^\s]+)\''), `DISCORD_CHANNEL_NAME: '${newChannel}'`))
                            msg.channel.send(`Ура! Теперь я шлю сообщения на канале ${newChannel}`)
                                .then(() => msg.delete(1000 * 2));
                        }
                        else msg.channel.send('Ошибка! Такого канала не существует')
                            .then(() => msg.delete(1000 * 2));
                    }
                    else msg.channel.send('Ошибка! Вы не указали название нового канала')
                        .then(() => msg.delete(1000 * 2));
                }

                if (args[1] == 'rate') {
                    if (args[2]) {
                        let time = parseInt(args[2]);
                        if (time) {
                            config.VK_CHECK_RATE = time;
                            fs.writeFileSync('./config.ts', fs.readFileSync('./config.ts', 'utf8').replace(new RegExp('VK_CHECK_RATE: \'([^\s]+)\''), `VK_CHECK_RATE: '${time}'`))
                            msg.channel.send(`Ура! Теперь я шлю сообщения раз в ${time} минут(у)`)
                                .then(() => msg.delete(1000 * 2));
                        }
                        else msg.channel.send('Ошибка! Это не число')
                            .then(() => msg.delete(1000 * 2));
                    }
                    else msg.channel.send('Ошибка! Вы не ввели число')
                        .then(() => msg.delete(1000 * 2));
                }

                if (args[1] == 'name') {
                    if (args[2]) {
                        discord.user.setUsername(args.slice(2, args.length - 1).join(' '));
                        msg.channel.send(`Ура! Теперь меня зовут ${args[2]}`)
                            .then(() => msg.delete(1000 * 2));
                    }
                    else msg.channel.send('Ошибка! Вы не указали имя')
                        .then(() => msg.delete(1000 * 2));
                }
                break;

            default:
                break;
        }
    }
});
discord.login(config.DISCORD_API_KEY);

vk_parser.ee.on('ready', () => console.log('Начали слушать группу в ВК'));
vk_parser.ee.on('error', err => console.error(`Произошла ошибка ${err}! Ошибка: ${JSON.stringify(err)}`));
vk_parser.ee.on('newPost', (post: VKPost) => {
    queueManager.retryQueue();
    if (!queueManager.hasPostInQueue(post.id)) {
        queueManager.addToQueue('discord', post, true);
        queueManager.addToQueue('telegram', post, true);
        queueManager.addToQueue('github', post, true);
    }
});
