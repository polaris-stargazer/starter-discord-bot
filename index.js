require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;
const POINTS_CHANNEL_ID = process.env.POINTS_CHANNEL_ID; // ポイントを管理しているチャンネルのID

const axios = require('axios');
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware, InteractionResponseFlags } = require('discord-interactions');

const app = express().use(express.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  headers: {
    "Authorization": `Bot ${TOKEN}`
  }
});

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data.name === 'myPoints') {
    // ポイント管理チャンネルから最新のメッセージを取得
    try {
      const messagesResponse = await discord_api.get(`/channels/${POINTS_CHANNEL_ID}/messages?limit=1`);
      const latestMessage = messagesResponse.data[0];
      const userId = interaction.member.user.id;
      const username = interaction.member.user.username;
      const pointPattern = new RegExp(`<@!?${userId}> has (\\d+) points`); // メンバーIDを使ってポイントを検索
      const match = latestMessage.content.match(pointPattern);

      if (match && match[1]) {
        // メンバーに直接メッセージを送信
        await discord_api.post(`/interactions/${interaction.id}/${interaction.token}/callback`, {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `<@${userId}> さんは${match[1]}ポイント保有しています。`,
            flags: InteractionResponseFlags.EPHEMERAL // メッセージをコマンドを使用したユーザーにのみ表示
          }
        });
      } else {
        // ポイントが見つからなかった場合の処理
        await discord_api.post(`/interactions/${interaction.id}/${interaction.token}/callback`, {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `ポイント情報が見つかりませんでした。`,
            flags: InteractionResponseFlags.EPHEMERAL
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages or responding to command:', error);
    }
  }
});

    // 以下を追記: ギルド固有のスラッシュコマンドを登録するコード
    const guildId = '1211874680240349195'; // 対象のギルドIDを設定
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.warn(`ギルドが見つかりません: ${guildId}`);
        return;
    }

    try {
        // '/myPoints' コマンドを登録
        await guild.commands.create({
            name: 'myPoints',
            description: 'Shows your current points.'
        });

        console.log(`'myPoints' コマンドを ${guild.name} に登録しました。`);
    } catch (error) {
        console.error(`コマンドの登録に失敗しました: ${error}`);
    }
});


app.listen(8999, () => {
  console.log('Server is running on port 8999');
});
