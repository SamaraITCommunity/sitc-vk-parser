export = {
    VK_GROUP_ID: 143954349,
    VK_API_KEY: process.env.VK_API_KEY,
    VK_CHECK_RATE: 60,

    TELEGRAM_CHANNEL_ID: '@Samara_IT_Community',
    TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY,
    DISCORD_ADMIN_ROLE: 'Валар',

    DISCORD_CHANNEL_NAME: 'general',
    DISCORD_API_KEY: process.env.DISCORD_API_KEY,

    GITHUB_USERNAME: 'humb1t',
    GITHUB_REPO_NAME: 'SamaraITCommunity/site',
    GITHUB_API_KEY: process.env.GITHUB_API_KEY,

    text: {
        github: {
            TEMPLATE: '+++ title = "%title%" date = %date*YYYY-MM-DD% description = "%description%" +++\n\n%photos%',
            NO_DESCRIPTION: 'Описание отсутствует'
        }
    }
}
