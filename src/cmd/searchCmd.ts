import { SlashCommandBuilder } from '@discordjs/builders';
import { searchSteamApps } from '../games/steam';

const QUERY_COUNT = 10;

module.exports = {
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
        const results = searchSteamApps(interaction.content, QUERY_COUNT);
        await interaction.reply(JSON.stringify(results));
    }
}
