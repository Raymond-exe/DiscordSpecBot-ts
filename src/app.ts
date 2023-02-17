import { Client, Intents, Message } from 'discord.js';
import { DiscordCommand, loadCommands, registerCommands } from './cmd/command';
import dotenv from 'dotenv';

dotenv.config();



// create client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});


// login client
client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('\n-----------------\n| Bot is ready. |\n-----------------\n') );


// load & register commands
const commands: DiscordCommand[] = loadCommands();
registerCommands(commands, { TOKEN: process.env.DISCORD_TOKEN, CLIENT_ID: process.env.DISCORD_CLIENT_ID });


// interaction (command) handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

	const command = getCommand(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	} else try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        // TODO send errors to a dedicated channel
	}

});

function getCommand(name) {
    for (const cmd of commands) {
        if (cmd.data.name === name) {
            return cmd;
        }
    }
    return null;
}


// message handler, checks if user messages start with a ping for this bot
client.on('messageCreate', (message: Message) => {
    if (message.content.split(' ')[0].startsWith(client.user.discriminator)) {
        // TODO do the cool thing!
    }
});
