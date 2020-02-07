export = {
    VK_GROUP_ID: parseInt(process.env.VK_GROUP_ID),
    VK_API_KEY: process.env.VK_API_KEY,
    VK_CHECK_RATE: parseFloat(process.env.VK_CHECK_RATE),

    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY,

    DISCORD_ADMIN_ROLE: process.env.DISCORD_ADMIN_ROLE,
    DISCORD_CHANNEL_NAME: process.env.DISCORD_CHANNEL_NAME,
    DISCORD_API_KEY: process.env.DISCORD_API_KEY,

    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    GITHUB_API_KEY: process.env.GITHUB_API_KEY,

    text: {
        github: {
            TEMPLATE: '+++ title = "%title%" date = %date.YYYY[-]MM[-]DD% description = "%description%" +++\n\n%photos%',
            NO_DESCRIPTION: 'Описание отсутствует'
        }
    }
}
