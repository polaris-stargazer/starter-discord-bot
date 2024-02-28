// 必要なライブラリをインポート
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

// 環境変数から設定を読み込む
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const APPLICATION_ID = process.env.APPLICATION_ID;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const POINTS_CHANNEL_ID = process.env.POINTS_CHANNEL_ID;

// Discord.jsのクライアントを初期化
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    {
        name: 'myPoints',
        description: 'Shows your current points.'
    }
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

// アプリケーションが起動したときに一度だけ実行される
client.once('ready', async () => {
    console.log('Bot is online!');

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// スラッシュコマンドが実行されたときの処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'myPoints') {
        const pointsChannel = await client.channels.fetch(POINTS_CHANNEL_ID);
        const messages = await pointsChannel.messages.fetch({ limit: 100 });
        const pointsMessage = messages.find(msg => msg.content.includes(interaction.user.id));
        let points = 0;

        if (pointsMessage) {
            const match = pointsMessage.content.match(/<@\d+>\s+has\s+(\d+)\s+points/);
            points = match ? parseInt(match[1]) : 0;
        }

        await interaction.reply(`You have ${points} points.`);
    }
});

// Botをログインさせる
client.login(TOKEN);
