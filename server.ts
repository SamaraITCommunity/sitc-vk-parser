// Сторонние либы
import Discord = require('discord.js');

// Какой-то агли код
import VKParser = require('./libs/api/vk_api');
import { VKPost } from './interfaces';
import TelegramAPI = require('./libs/api/telegram_api');
import config = require('./config');
import { QueueManager } from './libs/utils';
let queueManager = new QueueManager();

// БД
import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
let adapter = new FileSync('db.json');
export let db = low(adapter);
db.defaults({
    vk: { lastCheckTime: 0 }
})
    .write();

export let discord = new Discord.Client();
export let vk_parser = new VKParser({ token: config.VK_API_KEY, groupID: config.VK_GROUP_ID });
export let telegram = new TelegramAPI(config.TELEGRAM_API_KEY);

discord.on('ready', () => {
    console.log(`Дискорд бот работает на аккаунте ${discord.user.tag}!`);
});

discord.login(config.DISCORD_API_KEY);

vk_parser.ee.on('ready', () => console.log('Начали слушать группу в ВК'));
vk_parser.ee.on('error', err => console.error(`Произошла ошибка! Ошибка: ${err}`));
vk_parser.ee.on('newPost', (post: VKPost) => {
    queueManager.retryQueue();
    queueManager.addToQueue('discord', post, true);
    queueManager.addToQueue('telegram', post, true);
    queueManager.addToQueue('github', post, true);
});