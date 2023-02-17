import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';

const IGNORE_INVALID_COMMANDS = true;

export interface DiscordCommand {
    data: SlashCommandBuilder;
    execute: Function;
}

export function loadCommands(): DiscordCommand[] {
    const cmds = [];
    const commandFiles = fs.readdirSync('./src/cmd/').filter(file => file.endsWith('Cmd.ts'));

    for (const file of commandFiles) try {
        const command: DiscordCommand = require(`./${file}`);
        cmds.push(command);
    } catch (e) {
        console.log(`Failed to load ${file}!`);
        if (!IGNORE_INVALID_COMMANDS) throw e;
    }

    console.log(`Finished loading ${cmds.length} commands.`);

    return cmds;
}

export async function registerCommands(cmds: DiscordCommand[], botInfo: { TOKEN: string, CLIENT_ID: string }) {
    const rest = new REST({ version: '9' }).setToken(botInfo.TOKEN);

    const commandJsons = [];
    for (const cmd of cmds) {
        commandJsons.push(cmd.data.toJSON());
    }

    await rest.put(
        Routes.applicationCommands(botInfo.CLIENT_ID),
        { body: commandJsons },
    );

    console.log(`Registered ${cmds.length} commands via Discord REST API.`)
}

export function getMessageParameters(interaction) {
    const parameters = {};
    for (const option of interaction['options']['_hoistedOptions']) {
        parameters[option.name] = option.value;
    }
    return parameters;
}
