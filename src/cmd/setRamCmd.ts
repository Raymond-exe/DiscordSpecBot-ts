import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder().setName('setram')
    .setDescription('Assigns the RAM in gb for your PC build.')
    .addStringOption(option =>
        option.setName('gb')
        .setDescription('Amount of RAM in GB')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        await interaction.reply('ye ram');
    }
}
