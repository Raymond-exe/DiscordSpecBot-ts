import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { searchSteamApps, SteamGame } from '../games/steam';

const QUERY_COUNT = 25;
const RESULTS_PER_PAGE = 5;

const SEARCH_CACHE: Map<String, SteamGame[]> = new Map();

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
    execute: async (interaction: Message) => {
        const query: string = interaction.content;

        if (!SEARCH_CACHE.has(query.toLowerCase())) {
            SEARCH_CACHE.set(query.toLowerCase(), searchSteamApps(query, QUERY_COUNT));
        }
        const results = SEARCH_CACHE.get(query);

        await interaction.reply(JSON.stringify(results));
    }
}
