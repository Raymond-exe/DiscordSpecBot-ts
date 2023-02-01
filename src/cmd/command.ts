import * as fs from 'fs';

export function loadCommands() {
    const cmds = {};
    const commandFiles = fs.readdirSync('./src/cmd/').filter(file => file.endsWith('Cmd.ts'));

    for (const file of commandFiles) try {
        console.log(`Loading ${file}...`);
        const command = require(`./${file}`);
        if ('data' in command && 'execute' in command) {
            cmds[command.data.name] = command.execute;
            console.log(`Successfully loaded ${file}`);
        } else {
            console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
        }
    } catch (e) {
        console.log(`Failed to initialize ${file}, skipping...`);
    }

    console.log(JSON.stringify(cmds));

    return cmds;
}

loadCommands();
