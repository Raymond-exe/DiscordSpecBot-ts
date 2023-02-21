import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { searchSteamApps, SteamGame } from '../games/steam';
import { searchHardware } from '../hardware/utils';
import { getMessageParameters } from './command';
import { Hardware } from '../hardware/hardware';

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
        const query: string = parameters['query'];
        let results: (SteamGame | Hardware)[];

        // TODO refine
        switch (parameters['type']) {
            case 'CPU':
                results = await searchHardware('CPU', query);
                interaction.reply(JSON.stringify(results));
                break;
            case 'GPU':
                results = await searchHardware('GPU', query);
                interaction.reply(JSON.stringify(results));
                break;
            case 'Steam':
                results = searchSteamApps(query);
                const games = [];
                results.forEach( (i: SteamGame) => games.push(i.name) );

                // TODO make embed

                // interaction.reply(JSON.stringify(games));
                break;
        }
    }
}
