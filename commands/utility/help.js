const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Provides list of commands available."),
  async execute(interaction) {
    let helpMessage = "Here are the available commands:\n\n";

    // Assuming this.client.commands is a Collection of your commands in your main Bot class
    interaction.client.commands.forEach((command) => {
      helpMessage += `\`${command.data.name}\`: ${command.data.description}\n`;
    });

    await interaction.reply(helpMessage);
  },
};
