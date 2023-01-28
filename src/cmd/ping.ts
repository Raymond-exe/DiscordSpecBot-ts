import { SlashCommandBuilder } from '@discordjs/builders';

export const pingCmd = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(':ping_pong: Ping-pong!'),
    execute: async (interaction) => {
        await interaction.reply(':ping_pong: Pong!')
    }
}
