require("dotenv").config();
const { Bot } = require("./models/Bot");
const { createGuildIfNotExist } = require("./utils/guildServices");

const bot = Bot.getInstance();

bot.login(bot.token);

bot.on("ready", () => {
  console.log(`Bot is running as ${bot.user.tag}`);

  bot.guilds.cache.forEach(async (guild) => {
    await createGuildIfNotExist(guild.id, guild.name);
  });
});
