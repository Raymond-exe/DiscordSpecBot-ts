import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { User } from '../hardware/user';
import { getAuthor, Parse } from '../hardware/utils';
import { getMessageParameters } from './command';

module.exports = {
    data: new SlashCommandBuilder().setName('setcpu')
    .setDescription('Assigns the central processor for your PC build.')
    .addStringOption(option =>
        option.setName('cpu')
        .setDescription('Name of your CPU')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        const parameters = getMessageParameters(interaction);
        const name = parameters['cpu'];
        const CPU = await Parse.cpu(name);
        const author = getAuthor(interaction);

        console.log(author);

        const success = false;

        const userSpecs = User.getUser(Number(author.id));
        console.log(userSpecs);

        await interaction.reply(success ? `Set your CPU to ${CPU.name}` : `Failed to set your CPU as ${CPU.name}, please try again shortly!`);

        if (!success) {
            // TODO error logging
        }
    }
}
