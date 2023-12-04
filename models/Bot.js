const { Client, IntentsBitField } = require("discord.js")

class Bot extends Client {
    constructor(props = {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildEmojisAndStickers,
            IntentsBitField.Flags.GuildVoiceStates,
            IntentsBitField.Flags.GuildBans
        ],
        token: process.env.TOKEN
    }) {
        super(props)

        this.login(props.token)

        this.on('ready', () => {
            console.log(`Bot is running as ${this.user.tag}`)
        })
    }
}

module.exports.Bot = Bot