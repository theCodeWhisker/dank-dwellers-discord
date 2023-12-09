const {
  Client,
  IntentsBitField,
  Collection,
  Events,
  GatewayIntentBits,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const logger = require("../utils/logger");

class Bot extends Client {
  commands = new Collection();

  constructor(options = {}) {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildVoiceStates,
        GatewayIntentBits.Guilds,
      ],
    });

    this.token = options.token || process.env.TOKEN;

    this.loadCommands();
    this.registerEventHandlers();
  }

  loadCommands() {
    const foldersPath = path.join(process.cwd(), "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
          this.commands.set(command.data.name, command);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }
  }

  registerEventHandlers() {
    this.on(Events.InteractionCreate, this.handleInteraction);
  }

  get commands() {
    return this.commands;
  }

  async handleInteraction(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
      await this.getUser(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }

  async getGuildMember(interaction) {
    if (!interaction || !interaction.member) return null;

    return interaction.member;
  }

  sendHelpMessage(channel) {
    const helpMessage = this.commands
      .map((command) => `${command.name}: ${command.description}`)
      .join("\n");
    channel.send(helpMessage);
  }

  sendUserFeedback(interaction, message) {
    interaction.reply(message);
  }

  logEvent(eventType, details) {
    if (typeof details !== "string")
      return logger.error("Message must be a string when logging.");
    if (eventType === "error") return logger.error(details);
    if (eventType === "warn") return logger.warn(details);
    else return logger.info(details);
  }

  getServerInfo(guild) {
    // Return server information
  }

  trackUserActivity(user, activityType) {
    // Implementation to track user activity
  }

  scheduleMessage(channel, message, time) {
    // Schedule a message to be sent
  }
}

module.exports.Bot = Bot;
