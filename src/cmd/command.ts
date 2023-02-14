import * as fs from 'fs';

const IGNORE_INVALID_COMMANDS = true;

export function loadCommands() {
    const cmds = {};
    const commandFiles = fs.readdirSync('./src/cmd/').filter(file => file.endsWith('Cmd.ts'));

    for (const file of commandFiles) try {
        const command = require(`./${file}`);

        cmds[command.data.name] = command.execute;
        console.log(`Loaded ${file}`);

    } catch (e) {
        console.log(`Failed to load ${file}!`);
        if (!IGNORE_INVALID_COMMANDS) throw e;
    }

    let keys = Object.keys(cmds);
    console.log(`Finished loading ${keys.length} commands: (${keys.join(', ')})`);

    return cmds;
}

loadCommands();
