import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { getMessageParameters } from './command';

module.exports = {
    data: new SlashCommandBuilder().setName('setram')
    .setDescription('Assigns the RAM in gb for your PC build.')
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('Your amount of RAM in GB')
        .setRequired(true)),
    execute: async (interaction: Message) => {
        const parameters = getMessageParameters(interaction);
        const ram = parameters['amount']; // int

        await interaction.reply(`You entered ${ram} ram`);
    }
}
