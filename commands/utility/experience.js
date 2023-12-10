const { SlashCommandBuilder } = require("discord.js");
const db = require("../../utils/database");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("experience")
    .setDescription("Check your current experience points"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      const result = await db.query(
        "SELECT exp_points FROM experience WHERE user_id = $1 AND guild_id = $2",
        [userId, guildId]
      );

      if (result.rowCount > 0) {
        const expPoints = result.rows[0].exp_points;
        await interaction.reply(`Your current experience points: ${expPoints}`);
      } else {
        await interaction.reply("You do not have any experience points yet.");
      }
    } catch (error) {
      logger.error(`Error in checkExperience command: ${error.message}`);
      await interaction.reply(
        "An error occurred while retrieving your experience points."
      );
    }
  },
};
