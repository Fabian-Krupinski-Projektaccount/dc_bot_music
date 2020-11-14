const dev = true;


//Modules
const Database = require('./util/Database');
const database = new Database();

require('dotenv').config()
const Discord = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const setTitle = require('console-title');
const consola = require('consola')
const db = require('quick.db');
if(!db.get('guilds')) {
    db.set('guilds', {});
}

if (dev) {
    db.delete('guilds');
}



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
    const client_id = client_list.length;     //first run =0

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
        const user_id = client.user.id;

        consola.ready(`Bot >>${client.user.tag}<<`);

        for (const guild of client.guilds.cache) {
            if (!guild[1].members.cache.get(user_id).guild.voice || !guild[1].members.cache.get(user_id).guild.voice.channel) continue;
            const voice_channel = guild[1].members.cache.get(user_id).guild.voice.channel;
            voice_channel.leave();  //After restart has to leave-join-leave to rly get out of channel dunno why
            voice_channel.join();
            voice_channel.leave();
        }

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

        if (database.getCommandIndex(message.guild.id, message.id) == -1) {
            database.pushCommand(message.guild.id, command_object);
            runCommand(message.guild.id, command_object);
        }

        const command_index = database.getCommandIndex(message.guild.id, message.id);
        command_object = db.get(`guilds.${message.guild.id}.command_queue[${command_index}]`);

        if (database.isClientIdInList(message.guild.id, command_index, client.user.id) == false) {
            database.pushClientId(message.guild.id, command_index, client.user.id);
        }

        //console.log(database.getCommandQueue(message.guild.id));
    });
});

function runCommand(guild_id, command_object) {
    var command_object = command_object;
    const command_index = database.getCommandIndex(guild_id, command_object.message_id);

    setTimeout(async function() {
        var heuristik_list = [];
        var highestHeuristik = -99999;
        var highestHeuristikClient;

        for (const client_id of db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`)) {

            //Get client to client_id
            for (const _client of client_list) {
                if (_client.user.id == client_id) {
                    var client = _client;
                    break;
                }
            }


            const heuristik_id = heuristik_list.length;
            //get message to command_object.message_id
            const message = client.channels.cache.get(command_object.channel_id).messages.cache.get(command_object.message_id);


            //get heuristik for client
            heuristik_list[heuristik_id] = client.commands.get(command_object.command_name).getHeuristikForClient(message, command_object.args, client);

            //if heuristik for client than old highestHeuristik make heuristik new highestHeuristik
            if (highestHeuristik < heuristik_list[heuristik_id] || !heuristik_list[heuristik_id-1]) {
                highestHeuristik = heuristik_list[heuristik_id];
                highestHeuristikClient = client;
            }
        }

        console.log(highestHeuristikClient.user.username);
        highestHeuristikClient.commands.get(command_object.command_name).execute(message, command_object.args, highestHeuristikClient);
    }, 200);
}


//https://www.voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
//https://github.com/eritislami/evobot/blob/f9c0cf69a636476f0c3c60f799842c029ee7e34d/index.js#L25
