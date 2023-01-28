import { Client, Intents, Message } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [ 
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => console.log('---------------\n|Bot is ready.|\n---------------\n') );

client.on('messageCreate', handleMessage);
function handleMessage(message: Message) {
    if (message.content.split(' ')[0].startsWith(client.user.discriminator)) {
        // TODO do the cool thing!
    }
}
