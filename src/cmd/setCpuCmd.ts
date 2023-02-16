import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { Parse } from '../hardware/utils';

module.exports = {
    data: new SlashCommandBuilder().setName('setcpu')
    .setDescription('Assigns the CPU for your PC build.')
    .addStringOption(option =>
        option.setName('cpu')
        .setDescription('Name of the CPU')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        const name = ""; // TODO get CPU Name option
        const CPU = await Parse.cpu(name);

        // TODO assign CPU to user's build

        await interaction.reply('CPU');
    }
}
