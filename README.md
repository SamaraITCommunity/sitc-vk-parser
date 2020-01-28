## SITC парсер постов ВК

![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ffax1ty%2Fsitc-vk-parser.svg?type=large)

### Функционал
Размещение постов из [VK](https://vk.com/samara_it_community):

✔️ Push в [репозиторий сайта sitc.community](https://github.com/SamaraITCommunity/site).
❌ Публикация в twitter.
✔️ Публикация в [telegram-канале](t.me/Samara_IT_Community).
✔️ Публикация в [Discord](https://discord.gg/Vtnrgym).
✔️ Упоминания сообществ и людей (‘@’ ‘*’).
✔️ Очищать теги от `@samara_it_community`.
⚠️ Поддержка подкастов (ограниченная поддержка).
⚠️ Поддержка статей и их превью (ограниченная поддержка).
✔️ Для хранения изображений используется LFS или внешний сервис (все изображения хранятся только на серверах ВК).

### Настройка

1. Заполнить параметры в `config.ts`.
1. Установить [YARN](https://yarnpkg.com/getting-started/install/).
1. Установить TS-NODE и Lodash - `yarn add ts-node` и `yarn add lodash`.

#### VK_GROUP_ID
ID группы ВК. Может быть как отрицательным, так и положительным. Главное чтобы оно принадлежало группе
#### VK_API_KEY
Токен для обращения к API ВК. Можно получить здесь: https://vkhost.github.io/
#### TELEGRAM_API_KEY
Токен бота. Можно получить у @BotFather
#### TELEGRAM_CHANNEL_ID
ID канала. Тоже самое, что и ссылка. Может быть с @ или без
#### DISCORD_API_KEY
Токен Discord-бота. Можно получить тут: https://discordapp.com/developers/applications/
Приглашать по ссылке: ttps://discordapp.com/oauth2/authorize?client_id=`ИД БОТА`&scope=bot&permissions=452672
#### DISCORD_CHANNEL_NAME
Человеческое название канала (general) в гильдии где есть бот.
#### GITHUB_API_KEY
Ключ доступа для GitHub. Установите права для работы с репозиториями! Получить можно тут: https://github.com/settings/tokens
#### GITHUB_USERNAME
Ваш username на GitHub
#### GITHUB_REPO_NAME
Название репозитория, в котором расположен сайт. Можно сфоркать отсюда: https://github.com/SamaraITCommunity/site

### Производительность
![Alt](https://i.imgur.com/JQ9sDTn.png)
