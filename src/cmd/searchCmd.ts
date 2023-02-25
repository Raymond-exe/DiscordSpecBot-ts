import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { getSteamThumbnailURL, searchSteamApps, SteamGame } from '../games/steam';
import { searchHardware } from '../hardware/utils';
import { getMessageParameters } from './command';
import { Hardware } from '../hardware/hardware';

const QUERY_COUNT = 25;
const RESULTS_PER_PAGE = 5;

const AUTHORS = {
    steam: {name: 'Results via Steam', url: 'https://store.steampowered.com', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077667442664415383/steam.png?width=64&height=64'},
    cpu: {name: 'Results via TechPowerUp', url: 'https://www.techpowerup.com/cpu-specs/', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077994564801015848/image.png?width=64&height=64'},
    gpu: {name: 'Results via TechPowerUp', url: 'https://www.techpowerup.com/gpu-specs/', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077994564801015848/image.png?width=64&height=64'},
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a CPU, GPU, or a game on Steam.')
    .addStringOption(option =>
        option.setName('type')
        .setDescription('("CPU"/"GPU"/"Steam")')
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
        const embedFields: { name: string, value: string, inline?: boolean }[] = [];

        // TODO refine
        switch (parameters['type']) {
            case 'CPU':
                results = await searchHardware('CPU', query);
                results.forEach( (i: Hardware) => {
                    embedFields.push({name: i.name, value: JSON.stringify(i)});
                });

                interaction.reply(JSON.stringify(results));
                break;
            case 'GPU':
                results = await searchHardware('GPU', query);
                results.forEach( (i: Hardware) => {
                    embedFields.push({name: i.name, value: JSON.stringify(i)});
                });

                interaction.reply(JSON.stringify(results));
                break;
            case 'Steam':
                results = await searchSteamApps(query);
                results.forEach( (i: SteamGame) => {
                    embedFields.push({name: `(${i.name})[${i.getLink()}]`, value: ' '});
                });

                const steamEmbed = new MessageEmbed()
                    .setTitle(`Search results for *${query}*...`)
                    .setURL(`https://store.steampowered.com/search/?term=${query.replaceAll(' ', '+')}`)
                    .setThumbnail(await getSteamThumbnailURL(query))
                    .setColor('#FFFFFF')
                    .setAuthor(AUTHORS.steam)
                    .addFields(embedFields);

                interaction.reply({embeds: [steamEmbed]});
                break;
        }
    }
}
