const { SlashCommandBuilder } = require("discord.js");
const db = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("viewroles")
    .setDescription("View your roles")
    .addBooleanOption((option) =>
      option
        .setName("currentguild")
        .setDescription("View roles in current guild only")
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const currentGuildOnly = interaction.options.getBoolean("currentguild");
    const guildId = currentGuildOnly ? interaction.guild.id : null;

    const roles = await getUserRoles(userId, guildId);
    const roleNames =
      roles.map((role) => role.role_name).join(", ") || "No roles found";

    await interaction.reply(`Your roles: ${roleNames}`);
  },
};

async function getUserRoles(userId, guildId = null) {
  let query =
    "SELECT r.role_name FROM user_guild_roles ugr INNER JOIN roles r ON ugr.role_id = r.role_id WHERE ugr.user_id = $1";
  let queryParams = [userId];

  if (guildId) {
    query += " AND ugr.guild_id = $2";
    queryParams.push(guildId);
  }

  const result = await db.query(query, queryParams);
  return result.rows;
}
