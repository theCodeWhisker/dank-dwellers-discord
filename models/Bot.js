const {
  Client,
  IntentsBitField,
  Collection,
  Events,
  GatewayIntentBits,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

class Bot extends Client {
  commands = new Collection();

  constructor(
    props = {
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildBans,
        GatewayIntentBits.Guilds,
      ],
      token: process.env.TOKEN,
    }
  ) {
    super(props);

    this.login(props.token);

    this.on("ready", () => {
      console.log(`Bot is running as ${this.user.tag}`);
    });

    this.loadCommands();

    this.on(Events.InteractionCreate, this.executeCommand);
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

  get commands() {
    return this.commands;
  }

  async executeCommand(interaction) {
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

  async getUser(interaction) {
    if (!interaction) return;
    if (!interaction.member) return;

    return interaction.member;
  }
}

module.exports.Bot = Bot;
