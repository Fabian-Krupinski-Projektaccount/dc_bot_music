//Modules
require('dotenv').config()
const fs = require('fs-extra');
const path = require('path');
const setTitle = require('console-title');
const consola = require('consola')
const db = require('quick.db');

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
if(!db.get('guilds')) {
    db.set('guilds', {});
}
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

        client.guilds.cache.forEach(guild => {
            if(!db.get(`guilds.${guild.id}`)) {
                db.set(`guilds.${guild.id}`, {
                    guild_id: guild.id,
                    command_queue: [],
                    client_list: []
                });
            }
        });
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
    client.on('message', async message => {
    	if (message.author.bot) return;
    	if (!message.content.startsWith(client.prefix)) return;

    	const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
    	const commandName = args.shift().toLowerCase();

    	const command =
    		client.commands.get(commandName) ||
    		client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    	if (!command) return;

        if (!client.guild_list[message.guild.id]) {
            client.guild_list[message.guild.id] = {
                voiceChannel: null,
                volume: 5,
                music: {
                    queue: new Map(),
                    isPlaying: false
                }
            };
        }

        if (client == await getBestClientToRunCommand(message, args, command)) {
        	try {
        		command.execute(message, args, client);
        	} catch (error) {
        		consola.error(new Error('Executing Command'))
        		message.reply('There was an error executing that command.');
        	}
        }
    });
});


async function getBestClientToRunCommand(message, args, command) {
    var heuristik = [];
    var highestHeuristikClient;

    for (const client of client_list) {
        let id = heuristik.length;

        console.log(client.user.username);
        heuristik[id] = await command.getHeuristikForRunningCommand(message, args, client);

        if (heuristik[id-1] < heuristik[id] || !heuristik[id-1]) {
            highestHeuristikClient = client;
        }
    }

    return highestHeuristikClient;
}

//https://www.voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
//https://github.com/eritislami/evobot/blob/f9c0cf69a636476f0c3c60f799842c029ee7e34d/index.js#L25
