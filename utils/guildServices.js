const logger = require("./logger");
const db = require("./database");

async function createGuildIfNotExist(guildId, guildName) {
  try {
    const guildExists = await db.query(
      "SELECT * FROM guilds WHERE guild_id = $1",
      [guildId]
    );

    if (guildExists.rowCount === 0) {
      await db.query(
        "INSERT INTO guilds (guild_id, guild_name) VALUES ($1, $2)",
        [guildId, guildName]
      );
      logger.info(`New guild added: ${guildName}`);
    }
  } catch (error) {
    logger.error(`Error in createGuildIfNotExist: ${error.message}`);
  }
}

module.exports = {
  createGuildIfNotExist,
};
