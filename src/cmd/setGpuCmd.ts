import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { Parse } from '../hardware/utils';
import { getMessageParameters } from './command';

module.exports = {
    data: new SlashCommandBuilder().setName('setgpu')
    .setDescription('Assigns the graphics card for your PC build.')
    .addStringOption(option =>
        option.setName('gpu')
        .setDescription('Name of your GPU')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        const parameters = getMessageParameters(interaction);
        const name = parameters['gpu'];
        const GPU = await Parse.cpu(name);

        // TODO assign GPU to user's build
        const success = false;

        await interaction.reply(success ? `Set your GPU to ${GPU.name}` : `Failed to set your GPU as ${GPU.name}, please try again shortly!`);

        if (!success) {
            // TODO error logging
        }
    }
}
