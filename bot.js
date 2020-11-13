//Modules
require('dotenv').config()
const fs = require('fs-extra');
const path = require('path');
const setTitle = require('console-title');
const consola = require('consola')
var Database = require('./util/Database');
const database = new Database();
Database = "";
const db = require('quick.db');

db.delete('guilds');

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

        if(!db.get(`guilds.${message.guild.id}`)) {
            db.set(`guilds.${message.guild.id}`, {
                guild_id: message.guild.id,
                command_queue: [],
            });
        }



    	if (message.author.bot) return;
    	if (!message.content.startsWith(client.prefix)) return;

    	const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
    	const commandName = args.shift().toLowerCase();

    	const command =
    		client.commands.get(commandName) ||
    		client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    	if (!command) return;


        var command_object = {
            channel_id: message.channel.id,
            message_id: message.id,
            args: args,
            command_name: command.name,
            client_ids: []
        };

        if (database.getCommandQueue(message.guild.id).objectIndexOf(command_object, 'message_id') == -1) {
            database.pushCommand(message.guild.id, command_object);
        }

        var command_index = database.getCommandIndex(message.guild.id, message.id);
        command_object = db.get(`guilds.${message.guild.id}.command_queue[${command_index}]`);

        //console.log(db.get(`guilds.${message.guild.id}.command_queue[${command_index}].client_ids`).indexOf(client.user.id));

        if (database.isClientIdInList(message.guild.id, command_index, client.user.id) == false) {
            database.pushClientId(message.guild.id, command_index, client.user.id);
        }

        console.log(database.getCommandQueue(message.guild.id));

        //console.log(db.get(`guilds.${message.guild.id}.command_queue[${command_index}].client_ids`).indexOf(client.user.id));
    });
});

function runCommand(guild_id) {
    var command_object = database.getCommandQueue(guild_id).shift();
    var command_index = database.getCommandIndex(guild_id, command_object.message_id);      //database.getCommandQueue().objectIndexOf(command_object, 'message_id')

    setTimeout(async function() {
        let heuristik_list = [];
        let highestHeuristikClient;

        for (const client of db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`)) {
            console.log(client);
            let id = heuristik_list.length;

            heuristik_list[id] = await client.commands.get(command_object.command_name).getHeuristikForClientToRunCommand(command_object.message, command_object.args, command_object.client);

            if (heuristik_list[id-1] < heuristik_list[id] || !heuristik_list[id-1]) {
                highestHeuristikClient = client;
            }
        }

        //highestHeuristikClient.commands.get(command_object.command_name).execute(command_object.message, command_object.args, command_object.client);
    }, 200);
}



Array.prototype.objectIndexOf = function(searchObject, searchTerm) {
    if(searchTerm) {
        for(var i = 0; i < this.length; i++) {
            if (this[i][searchTerm] === searchObject[searchTerm]) return i;
        }
        return -1;
    } else {
        for(var i = 0; i < this.length; i++) {
            if (JSON.stringify(this[i]) === JSON.stringify(searchObject)) return i;
        }
        return -1;
    }
}

//https://www.voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
//https://github.com/eritislami/evobot/blob/f9c0cf69a636476f0c3c60f799842c029ee7e34d/index.js#L25
