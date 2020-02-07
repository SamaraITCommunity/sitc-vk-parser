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

1. Создать и заполнить `.env` файл согласно `config.ts`
3. Установить [YARN](https://yarnpkg.com/getting-started/install/) (опционально).
4. Установить TS-NODE - `yarn global add ts-node` / `npm i -g ts-node`.

#### VK_GROUP_ID
ID группы ВК. Может быть как отрицательным, так и положительным. Главное чтобы оно принадлежало группе
#### VK_API_KEY
Токен для обращения к API ВК. Пользовательский токен можно получить здесь: https://vkhost.github.io/. Доступность методов можно посмотреть [тут](https://vk.com/dev/methods) и [тут](https://vk.com/dev/permissions)
#### TELEGRAM_API_KEY
Токен бота. Можно получить у @BotFather
#### TELEGRAM_CHANNEL_ID
ID канала. Тоже самое, что и ссылка. Может быть с @ или без
#### DISCORD_API_KEY
Токен Discord-бота. Можно получить тут: https://discordapp.com/developers/applications/
Приглашать по ссылке: ttps://discordapp.com/oauth2/authorize?client_id=`ИД БОТА`&scope=bot&permissions=452672
#### DISCORD_CHANNEL_NAME
Человеческое название канала (например, general) в гильдии, где есть бот.
#### GITHUB_API_KEY
Ключ доступа для GitHub. Установите права для работы с репозиториями! Получить можно тут: https://github.com/settings/tokens
#### GITHUB_USERNAME
Ваш username на GitHub
#### GITHUB_REPO_NAME
Название репозитория, в котором расположен сайт. Можно сфоркать отсюда: https://github.com/SamaraITCommunity/site

### Производительность
![Alt](https://i.imgur.com/JQ9sDTn.png)
