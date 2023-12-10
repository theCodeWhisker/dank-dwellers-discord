const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");
const db = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Add a new role (admin only)")
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Enter the role name")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const user = new User(interaction.user.id, guildId);

    if (!(await user.isAdmin(guildId))) {
      await interaction.reply(
        "You do not have permission to use this command."
      );
      return;
    }

    const roleName = interaction.options.getString("role");

    await db.query(
      "INSERT INTO roles (role_name) VALUES ($1) ON CONFLICT (role_name) DO NOTHING",
      [roleName]
    );
    await interaction.reply(`Role \`${roleName}\` added.`);
  },
};
