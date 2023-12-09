require("dotenv").config();
const { Bot } = require("./models/Bot");

const bot = new Bot();

bot.login(bot.token);

bot.on("ready", () => {
  console.log(`Bot is running as ${bot.user.tag}`);
});

module.exports = {
  bot,
};
