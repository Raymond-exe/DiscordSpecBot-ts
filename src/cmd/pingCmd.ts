import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(':ping_pong: Ping-pong!'),
    execute: async (interaction) => { // TODO find out what class interaction is
        await interaction.reply(':ping_pong: Pong!')
        console.log(`Interaction class: ${typeof interaction} | ${interaction.class}`);
        console.log(`Interaction keys: ${Object.keys(interaction)}`);
    }
}
