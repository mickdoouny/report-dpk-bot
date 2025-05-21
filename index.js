require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const { appendToSheet, findStatus } = require('./google');

const bot = new TelegramBot(process.env.BOT_TOKEN);
const app = express();
app.use(bodyParser.json());

app.post(`/bot${process.env.BOT_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  const text = msg.text;
  const chatId = msg.chat.id;
  const fromName = msg.from?.first_name || 'User';

  if (!text) return res.sendStatus(200);

  if (text.startsWith('/status')) {
    const [_, invoice] = text.split(' ');
    if (!invoice) {
      bot.sendMessage(chatId, '❌ Gunakan format: /status INV001');
    } else {
      const status = await findStatus(invoice);
      bot.sendMessage(chatId, status);
    }
  } else if (text.includes('|')) {
    const data = text.split('|').map(v => v.trim());
    if (chatId.toString() === process.env.TELEGRAM_GROUP_SALES && data.length >= 13) {
      await appendToSheet(process.env.SALES_SHEET_NAME, data);
      bot.sendMessage(chatId, `✅ Laporan SALES ${data[0]} dicatat.`);
    } else if (chatId.toString() === process.env.TELEGRAM_GROUP_PRODUKSI && data.length >= 4) {
      await appendToSheet(process.env.PRODUKSI_SHEET_NAME, data);
      bot.sendMessage(chatId, `✅ Laporan PRODUKSI ${data[0]} dicatat.`);
    } else {
      bot.sendMessage(chatId, '❌ Format data salah atau jumlah kolom kurang.');
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot jalan di port ${PORT}`);
});
