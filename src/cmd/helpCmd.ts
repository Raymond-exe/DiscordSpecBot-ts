import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Default help command for SpecBot'), // TODO write description
    execute: async (interaction: Message) => {
        await interaction.reply('kek');
        // TODO make a help thingy
    }
}
