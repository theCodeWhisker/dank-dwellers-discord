const db = require("../utils/database");

class Character {
  constructor(characterId, userId, guildId, characterName, characterData) {
    this.characterId = characterId;
    this.userId = userId;
    this.guildId = guildId;
    this.characterName = characterName;
    this.characterData = characterData;
  }

  async save() {
    if (this.characterId) {
      // Update existing character
      await db.query(
        "UPDATE characters SET character_data = $1 WHERE character_id = $2",
        [this.characterData, this.characterId]
      );
    } else {
      // Insert new character
      const result = await db.query(
        "INSERT INTO characters (user_id, guild_id, character_name, character_data) VALUES ($1, $2, $3, $4) RETURNING character_id",
        [this.userId, this.guildId, this.characterName, this.characterData]
      );
      this.characterId = result.rows[0].character_id;
    }
  }

  static async load(characterId) {
    const result = await db.query(
      "SELECT * FROM characters WHERE character_id = $1",
      [characterId]
    );
    if (result.rowCount > 0) {
      const { user_id, guild_id, character_name, character_data } =
        result.rows[0];
      return new Character(
        characterId,
        user_id,
        guild_id,
        character_name,
        character_data
      );
    }
    return null;
  }
}

module.exports = Character;
