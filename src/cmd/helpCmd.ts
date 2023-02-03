import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Default help command for SpecBot'), // TODO write description
    execute: async (interaction) => {
        await interaction.reply('kek');
        // TODO make a help thingy
    }
}
