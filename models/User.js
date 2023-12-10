const Character = require("./Character");
const db = require("../utils/database");
const logger = require("../utils/logger");

class User {
  constructor(userId, guildId) {
    this.userId = userId;
    this.guildId = guildId;
    this.characters = [];
  }

  async loadCharacters() {
    const result = await db.query(
      "SELECT character_id FROM characters WHERE user_id = $1 AND guild_id = $2",
      [this.userId, this.guildId]
    );
    for (const row of result.rows) {
      const character = await Character.load(row.character_id);
      this.characters.push(character);
    }
  }

  async getCurrentExperience(guildId) {
    const result = await db.query(
      "SELECT exp_points FROM experience WHERE user_id = $1 AND guild_id = $2",
      [this.userId, guildId]
    );
    return result.rowCount > 0 ? result.rows[0].exp_points : 0;
  }

  async checkLevelUp(guildId, currentExp) {
    const currentLevel = await this.getCurrentLevel(guildId);
    const requiredExp = currentLevel * 100;

    if (currentExp >= requiredExp) {
      const newLevel = currentLevel + 1;
      await db.query(
        "INSERT INTO levels (user_id, guild_id, level) VALUES ($1, $2, $3) ON CONFLICT (user_id, guild_id) DO UPDATE SET level = $3",
        [this.userId, guildId, newLevel]
      );
    }
  }

  async getCurrentLevel(guildId) {
    const result = await db.query(
      "SELECT level FROM levels WHERE user_id = $1 AND guild_id = $2",
      [this.userId, guildId]
    );
    return result.rowCount > 0 ? result.rows[0].level : 1; // Default level 1 if not found
  }

  async addExperience(guildId, amount) {
    const currentExp = await this.getCurrentExperience(guildId);
    const updatedExp = currentExp + amount;
    await db.query(
      "INSERT INTO experience (user_id, guild_id, exp_points) VALUES ($1, $2, $3) ON CONFLICT (user_id, guild_id) DO UPDATE SET exp_points = $3",
      [this.userId, guildId, updatedExp]
    );

    // Check for level up and update the level
    await this.checkLevelUp(guildId, updatedExp);
  }

  async isAdmin(guildId) {
    try {
      const adminRoleResult = await db.query(
        "SELECT role_id FROM roles WHERE role_name = $1",
        ["admin"]
      );
      if (adminRoleResult.rowCount === 0) {
        throw new Error("Admin role not found in roles table.");
      }
      const adminRoleId = adminRoleResult.rows[0].role_id;

      const userRoleResult = await db.query(
        "SELECT * FROM user_guild_roles WHERE user_id = $1 AND guild_id = $2 AND role_id = $3",
        [this.userId, guildId, adminRoleId]
      );
      return userRoleResult.rowCount > 0;
    } catch (error) {
      logger.error(`Error in User.isAdmin: ${error.message}`);
    }
  }
}

module.exports = User;
