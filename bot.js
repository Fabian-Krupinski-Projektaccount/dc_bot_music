//Modules
require('dotenv').config()
const fs = require('fs-extra');
const path = require('path');



const Discord = require('discord.js');



var conf = {
    "prefix": "m!",
    "name": "Music Bot"
}



const bot_token_list = [
    process.env.DISCORD_BOT_TOKEN0,
    process.env.DISCORD_BOT_TOKEN1,
    process.env.DISCORD_BOT_TOKEN2,
    process.env.DISCORD_BOT_TOKEN3
];
var client_list = [];

bot_token_list.forEach(token => {
    let client_id = client_list.length;

    client_list[client_id] = new Discord.Client()

    client_list[client_id].login(token);
    client_list[client_id].commands = new Discord.Collection();
    client_list[client_id].prefix = conf.prefix;
    client_list[client_id].name = conf.name;

    client_list[client_id].guild_list = {};
});



/**
 * Client Events
 */
client_list.forEach(client => {
    client.on('ready', () => {
        console.log(`Logged in as >>${client.user.tag}<<`);

        client.user.setPresence({
            activity: {
                name: 'Music', type: 'PLAYING'
            },
            status: 'online'
        })
    });
});

/**
 * Import all commands
 */
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(path.join(__dirname, 'commands', `${file}`));
    client_list.forEach(client => {
	       client.commands.set(command.name, command);
    });
	console.log(`Command >>\x1b[4m${command.name}\x1b[0m<< \x1b[32mloaded!\x1b[0m`);
}






client_list.forEach(client => {
    client.on('message', async msg => {
    	if (msg.author.bot) return;
    	if (!msg.content.startsWith(client.prefix)) return;

    	const args = msg.content.slice(client.prefix.length).trim().split(/ +/g);
    	const commandName = args.shift().toLowerCase();

    	const command =
    		client.commands.get(commandName) ||
    		client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    	if (!command) return;

        if (!client.guild_list[msg.guild.id]) {
            client.guild_list[msg.guild.id] = {
                music: {
                    queue: new Map(),
                    isPlaying: false,
                    dispatcher: null,
                    voiceChannel: null,
                    volume: 5
                }
            };
        }






    	try {
    		command.execute(msg, args, client);
    	} catch (error) {
    		console.error(error);
    		msg.reply("There was an error executing that command.").catch(console.error);
    	}
    });
});

//https://www.voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
//https://github.com/eritislami/evobot/blob/f9c0cf69a636476f0c3c60f799842c029ee7e34d/index.js#L25
