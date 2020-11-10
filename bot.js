//Modules
require('dotenv').config()
const fs = require('fs-extra');
const path = require('path');
const setTitle = require('console-title');
const consola = require('consola')



const Discord = require('discord.js');



var conf = {
    "prefix": "m!",
    "name": "Music Bot"
}
setTitle(`${conf.name} [${conf.prefix}]`);



const bot_token_list = [
    process.env.DISCORD_BOT_TOKEN0,
    process.env.DISCORD_BOT_TOKEN1,
    process.env.DISCORD_BOT_TOKEN2,
    process.env.DISCORD_BOT_TOKEN3
];
var client_list = [];

bot_token_list.forEach(token => {
    let client_id = client_list.length;     //first run =0

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
        consola.ready(`Bot >>${client.user.tag}<<`);

        setInterval(function() {
            client.user.setPresence({
                activity: {
                    name: `m!help on ${client.guilds.cache.size} server/s`, type: 'PLAYING'
                },
                status: 'online'
            })
        }, 3000);
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
	consola.success(`Command >>\x1b[4m${command.name}\x1b[0m<< loaded!`);
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


        if (client == await getBestClientToRunCommand(msg, args, command)) {
        	try {
        		command.execute(msg, args, client);
        	} catch (error) {
        		consola.error(new Error('Executing Command'))
        		msg.reply("There was an error executing that command.");
        	}
        }
    });
});


async function getBestClientToRunCommand(message, args, command) {
    var heuristik = [];
    var highestHeuristikClient;

    for (const client of client_list) {
        let id = heuristik.length;

        heuristik[id] = await command.getHeuristikForRunningCommand(message, args, client);

        if (heuristik[id-1] < heuristik[id] || !heuristik[id-1]) {
            highestHeuristikClient = client;
        }
    }

    return highestHeuristikClient;
}

//https://www.voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
//https://github.com/eritislami/evobot/blob/f9c0cf69a636476f0c3c60f799842c029ee7e34d/index.js#L25
