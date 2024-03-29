import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { getSteamThumbnailURL, searchSteamApps, SteamGame } from '../games/steam';
import { searchHardware } from '../hardware/utils';
import { getMessageParameters } from './command';
import { Hardware } from '../hardware/hardware';

// TODO pagination
const QUERY_COUNT = 25;
const RESULTS_PER_PAGE = 5;

const AUTHORS = {
    steam: {name: 'Results via Steam', url: 'https://store.steampowered.com', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077667442664415383/steam.png?width=64&height=64'},
    cpu: {name: 'Results via TechPowerUp', url: 'https://www.techpowerup.com/cpu-specs/', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077994564801015848/image.png?width=64&height=64'},
    gpu: {name: 'Results via TechPowerUp', url: 'https://www.techpowerup.com/gpu-specs/', iconURL: 'https://media.discordapp.net/attachments/637100839105855520/1077994564801015848/image.png?width=64&height=64'},
}

const CONFUSED_IMGS = [
    'https://media.discordapp.net/attachments/637100839105855520/1083466098680275064/querynotfound.gif', // le fishe
    'https://media.discordapp.net/attachments/754248166345408573/1083495879866056704/querynotfound.gif', // bluey
    'https://media.discordapp.net/attachments/917986986155966495/1083508939288739911/querySTILLnotfound.gif', // Vincent
    'https://media.discordapp.net/attachments/1067564328590524517/1083596856791138304/wah.gif', // wah
    'https://media.discordapp.net/attachments/1067564328590524517/1083497269447372800/QuerulousInconsequentialKissingbug-size_restricted.gif', // EMPTY
];

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
                results = await searchHardware('CPU', query, 5);

                if (results.length === 0) {
                    interaction.reply({ embeds: [getNoResultsEmbed(query, 'CPU', AUTHORS.cpu.url)] });
                    break;
                }

                results.forEach( (i: Hardware) => {
                    const fields = i.fields.CPU;
                    if (!fields) return;

                    const details = [ `${fields.cores} cores, ${fields.threads} threads` ];
                    if (fields.overClock) {
                        details.push(`Clockrate: *${fields.baseClock} - ${fields.overClock} GHz*`);
                    } else {
                        details.push(`Clockrate: *${fields.baseClock} GHz*`);
                    }

                    embedFields.push({name: i.name, value: details.join('\n')});
                });

                const cpuEmbed = new MessageEmbed()
                    .setTitle(`CPU Search results for *${query}*...`)
                    .setURL('https://www.techpowerup.com/cpu-specs/')
                    // .setThumbnail() // TODO
                    .setColor('#FFFFFF')
                    .setAuthor(AUTHORS.cpu)
                    .addFields(embedFields);

                interaction.reply({ embeds: [cpuEmbed] });
                break;
            case 'GPU':
                results = await searchHardware('GPU', query, 5);

                if (results.length === 0) {
                    interaction.reply({ embeds: [getNoResultsEmbed(query, 'GPU', AUTHORS.gpu.url)] });
                    break;
                }

                results.forEach( (i: Hardware) => {
                    const fields = i.fields.GPU;
                    if (!fields) return;

                    const details = [
                        `Memory: *${fields.memory} GB*`,
                        `GPU Clockrate: *${fields.gpuClock} MHz*`,
                        `Memory Clockrate: *${fields.memClock} MHz*`,
                    ];

                    embedFields.push({
                        name: i.name,
                        value: details.join('\n')
                    });
                });

                const gpuEmbed = new MessageEmbed()
                    .setTitle(`GPU Search results for *${query}*...`)
                    .setURL('https://www.techpowerup.com/gpu-specs/')
                    // .setThumbnail() // TODO
                    .setColor('#FFFFFF')
                    .setAuthor(AUTHORS.gpu)
                    .addFields(embedFields);

                interaction.reply({ embeds: [gpuEmbed] });
                break;
            case 'Steam':
                results = await searchSteamApps(query);

                if (results.length === 0) {
                    interaction.reply({ embeds: [getNoResultsEmbed(query, 'game', AUTHORS.steam.url)] });
                    break;
                }

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

export function getNoResultsEmbed(query: string, type: string, url: string = ''): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed()
        .setTitle(`No ${type}s found under \`${query}\`!`)
        .setDescription(`*Try searching for your ${type} [here](${url}).*`)
        .setThumbnail(`${random(CONFUSED_IMGS)}?width=64&height=64`)
        .setColor('#FF0000');

    return embed;

    function random(array: any[]) {
        return array[Math.floor(Math.random()*array.length)];
    }
}
