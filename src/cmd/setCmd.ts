import { SlashCommandBuilder } from '@discordjs/builders';
import { Parse } from '../hardware/utils';

export const setCpuCmd = {
    data: new SlashCommandBuilder().setName('setcpu')
    .setDescription('Assigns the CPU for your PC build.')
    .addStringOption(option => option.setName('CPU Name').setRequired(true)),
    execute: async (interaction) => {
        const name = ""; // TODO get CPU Name option
        const CPU = await Parse.cpu(name);

        // TODO assign CPU to user's build

        await interaction.reply('CPU');
    }
}

export const setGpuCmd = {
    data: new SlashCommandBuilder().setName('setgpu')
    .setDescription('Assigns the GPU for your PC build.')
    .addStringOption(option => option.setName('GPU Name').setRequired(true)),
    execute: async (interaction) => {
        await interaction.reply('GPU kek');
    }
}

export const setRamCmd = {
    data: new SlashCommandBuilder().setName('setram')
    .setDescription('Assigns the RAM in gb for your PC build.')
    .addStringOption(option => option.setName('GB').setRequired(true)),
    execute: async (interaction) => {
        await interaction.reply('ye ram');
    }
}
