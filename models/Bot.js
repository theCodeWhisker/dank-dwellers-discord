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
const {
  increaseUserExperience,
  createUserIfNotExist,
} = require("../utils/userServices");

class Bot extends Client {
  commands = new Collection();
  static instance;

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

  static getInstance() {
    if (!this.instance) {
      this.instance = new Bot();
    }

    return this.instance;
  }

  async handleError(interaction, error) {
    logger.error(error);

    if (interaction && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `An unexpected error occured. Please try again later.`,
        ephemeral: true,
      });
    }
  }

  loadCommands() {
    const foldersPath = path.join(process.cwd(), "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    try {
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
            logger.error(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        }
      }
    } catch (error) {
      logger.error(`Error loading commands: ${error.message}`);
    }
  }

  registerEventHandlers() {
    this.on(Events.InteractionCreate, this.handleInteraction);
    this.on(Events.MessageCreate, this.handleMessage);
  }

  get commands() {
    return this.commands;
  }

  async executeWithHandling(interaction, command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      this.handleError(interaction, error);
    }
  }

  async handleInteraction(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (command) {
      this.executeWithHandling(interaction, command);
    } else {
      logger.warn(`No command matching ${interaction.commandName} was found.`);
    }
  }

  async handleMessage(message) {
    if (message.author.bot) return;
    const userId = message.author.id;
    const guildId = message.guild.id;
    const username = message.author.username;

    await createUserIfNotExist(userId, username);
    await increaseUserExperience(userId, guildId, 1);
  }

  async getGuildMember(interaction) {
    if (!interaction || !interaction.member) return null;

    return interaction.member;
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
