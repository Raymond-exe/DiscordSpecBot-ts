import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [ 
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

client.on('ready', () => {
    console.log('---------------\nBot is ready.\n---------------\n');
});

client.on('messageCreate', (message) => {
    console.log(`Message received! ${message.content}`);
});

client.login(process.env.TOKEN);