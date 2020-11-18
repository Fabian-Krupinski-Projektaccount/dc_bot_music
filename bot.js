const dev = true;


//Modules
const Database = require('./util/Database');
const database = new Database();
database.setup(dev);

require('dotenv').config()
const Discord = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const consola = require('consola')
const db = require('quick.db');




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
var CLIENT_LIST = [];

bot_token_list.forEach(token => {
    const client_id = CLIENT_LIST.length;     //first run =0

    CLIENT_LIST[client_id] = new Discord.Client()

    CLIENT_LIST[client_id].login(token);
    CLIENT_LIST[client_id].commands = new Discord.Collection();
    CLIENT_LIST[client_id].prefix = conf.prefix;
    CLIENT_LIST[client_id].name = conf.name;

    CLIENT_LIST[client_id].guild_list = {};
});



/**
 * Client Events
 */
CLIENT_LIST.forEach(client => {
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
    CLIENT_LIST.forEach(client => {
	       client.commands.set(command.name, command);
    });
	consola.success(`Command >>\x1b[4m${command.name}\x1b[0m<< loaded!`);
}






CLIENT_LIST.forEach(client => {
    client.on('message', async message => {
        /*
        ----------------------VARIABLES----------------------
        */
        const guild_id = message.guild.id;
        const message_id = message.id;
        const client_id = client.user.id;
        const channel_id = message.channel.id;


        /*
        ----------------------CHECK IF MESSAGE IS VALID COMMAND----------------------
        */
        if (!database.guildExists(guild_id)) database.createGuild(guild_id);

    	if (message.author.bot) return;
    	if (!message.content.startsWith(client.prefix)) return;

    	const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
    	const commandName = args.shift().toLowerCase();

    	const command =
    		client.commands.get(commandName) ||
    		client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    	if (!command) return;


        /*
        ----------------------RUN----------------------
        */
        var command_object = {
            channel_id: channel_id,
            message_id: message_id,
            args: args,
            command_name: command.name,
            client_ids: []
        };

        if (database.getCommandIndex(guild_id, message_id) == -1) {
            database.pushCommand(guild_id, command_object);
            runCommand(guild_id, command_object);
        }

        const command_index = database.getCommandIndex(guild_id, message_id);
        command_object = database.getCommandObject(guild_id, message_id); //db.get(`guilds.${message.guild.id}.command_queue[${command_index}]`);

        if (database.isClientIdInList(guild_id, command_index, client_id) == false) {
            database.pushClientId(guild_id, command_index, client_id);
        }
    });
});

function runCommand(guild_id, command_object) {
    /*
    ----------------------VARIABLES----------------------
    */
    var guild_id = guild_id;
    var command_object = command_object;
    const command_index = database.getCommandIndex(guild_id, command_object.message_id);


    /*
    ----------------------SUB FUNCTION----------------------
    */
    setTimeout(async function() {
        /*
        ----------------------VARIABLES----------------------
        */
        var heuristik_list = [];
        var highestHeuristik = -99999;
        var highestHeuristikClient;
        var message = null;


        /*
        ----------------------RUN----------------------
        */
        for (const client_id of db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`)) {
            let heuristik_id = heuristik_list.length;
            let client = null;

            //Get client matching client_id
            for (const _client of CLIENT_LIST) {
                if (_client.user.id == client_id) {
                    client = _client;
                    break;  //break for loop when client is found
                }
            }

            //get message matching message_id
            message = client.channels.cache.get(command_object.channel_id).messages.cache.get(command_object.message_id);

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
