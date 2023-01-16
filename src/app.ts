import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [ 
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.on('ready', () => {
    console.log('Bot is ready.');
});

client.on('messageCreate', (message) => {
    console.log(`Message received! Type: ${typeof message}\nContents: ${message.content}`);
});

client.login(process.env.TOKEN);