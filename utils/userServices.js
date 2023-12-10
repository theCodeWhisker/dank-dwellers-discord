const db = require("./database");
const logger = require("./logger");

async function createUserIfNotExist(userId, username) {
  try {
    const userExists = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    if (userExists.rowCount === 0) {
      await db.query("INSERT INTO users (user_id, username) VALUES ($1, $2)", [
        userId,
        username,
      ]);
      logger.info(`New user created: ${username}`);
    }
  } catch (error) {
    logger.error(`Error in createUserIfNotExist: ${error.messaage}`);
  }
}

async function increaseUserExperience(userId, guildId, expToAdd) {
  try {
    const expRecord = await db.query(
      "SELECT * FROM experience WHERE user_id = $1 AND guild_id = $2",
      [userId, guildId]
    );

    if (expRecord.rowCount === 0) {
      await db.query(
        "INSERT INTO experience (user_id, guild_id, exp_points) VALUES ($1, $2, $3)",
        [userId, guildId, expToAdd]
      );
    } else {
      const newExp = expRecord.rows[0].exp_points + expToAdd;
      await db.query(
        "UPDATE experience SET exp_points = $1 WHERE user_id = $2 AND guild_id = $3",
        [newExp, userId, guildId]
      );
    }

    logger.info(`Experience updated for user ${userId} in guild ${guildId}`);
  } catch (error) {
    logger.error(`Error in increaseUserExperience: ${error.message}`);
  }
}

module.exports = {
  createUserIfNotExist,
  increaseUserExperience,
};
