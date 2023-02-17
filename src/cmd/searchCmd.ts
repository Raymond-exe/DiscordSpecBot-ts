import { SlashCommandBuilder } from '@discordjs/builders';
import { Message } from 'discord.js';
import { searchSteamApps } from '../games/steam';
import { getMessageParameters } from './command';

const QUERY_COUNT = 25;
const RESULTS_PER_PAGE = 5;

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
        option.setName('query')
        .setDescription('The hardware or game to search for.')
        .setRequired(true)
    ),
    execute: async (interaction: Message) => {
        const parameters = getMessageParameters(interaction);

        switch (parameters['type']) {
            case 'CPU':
                // TODO this
                break;
            case 'GPU':
                // TODO this
                break;
            case 'Steam':
                const results = searchSteamApps(parameters['query']);
                const games = [];
                for (let i of results) {
                    console.log(i);
                    games.push(i.name);
                }
                // TODO refine
                interaction.reply(JSON.stringify(games));
                break;
        }
    }
}
