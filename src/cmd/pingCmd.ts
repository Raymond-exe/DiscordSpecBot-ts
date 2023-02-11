import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(':ping_pong: Ping-pong!'),
    execute: async (interaction: Message) => {
        await interaction.reply(':ping_pong: Pong!');
        console.log(Object.keys(interaction));
    }
}
