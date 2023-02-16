import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { Parse } from '../hardware/utils';

module.exports = {
    data: new SlashCommandBuilder().setName('setgpu')
    .setDescription('Assigns the GPU for your PC build.')
    .addStringOption(option =>
        option.setName('gpu')
        .setDescription('Name of the GPU')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        const name = ""; // TODO get GPU Name option
        const GPU = await Parse.cpu(name);

        // TODO assign GPU to user's build

        await interaction.reply('GPU kek');
    }
}
