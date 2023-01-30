import { SlashCommandBuilder } from '@discordjs/builders';

export const searchCmd = {
    data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a CPU, GPU, or a game on Steam.')
    .addStringOption(option =>
        option.setName('type')
        .setDescription('("CPU"/"GPU"/"Game")')
        .setChoices({ name: 'CPU', value: 'CPU' }, { name: 'GPU', value: 'GPU' }, { name: 'Steam', value: 'Steam' })
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('search query')
        .setDescription('The name of hardware or game to search for.')
        .setRequired(true)
    ),
    execute: async (interaction) => {
        await interaction.reply(':ping_pong: Pong!')
    }
}
