const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");
const db = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modifyuserrole")
    .setDescription("Modify a user's role (admin only)")
    .addUserOption((option) =>
      option.setName("target").setDescription("Select a user").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Enter the new role")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const requestingUser = new User(interaction.user.id, guildId);

    if (!(await requestingUser.isAdmin(guildId))) {
      await interaction.reply(
        "You do not have permission to use this command."
      );
      return;
    }

    const targetUserId = interaction.options.getUser("target").id;
    const newRoleName = interaction.options.getString("role");

    const roleResult = await db.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      [newRoleName]
    );
    if (roleResult.rowCount === 0) {
      await interaction.reply(`Role ${newRoleName} does not exist.`);
      return;
    }
    const newRoleId = roleResult.rows[0].role_id;

    await db.query(
      "INSERT INTO user_guild_roles (user_id, guild_id, role_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, guild_id) DO UPDATE SET role_id = $3",
      [targetUserId, guildId, newRoleId]
    );
    await interaction.reply(`User's role updated to ${newRoleName}.`);
  },
};
