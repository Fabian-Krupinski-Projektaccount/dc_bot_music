const Database = require('./database');
const db = new Database();

const Discord = require('discord.js');
const consola = require('consola')
const path = require('path');
const fs = require('fs-extra');



class BotManager {
    constructor() {
        this.list = [];;
        this.prefix = 'm!';
        this.name = 'Music Bot';
    }

    init(token_list) {
        var that = this;

        for (const token of token_list) {
            const client_id = this.list.length;

            this.list[client_id] = new Discord.Client()

            this.list[client_id].login(token);
            this.list[client_id].commands = new Discord.Collection();
            this.list[client_id].prefix = this.prefix;
            this.list[client_id].name = this.name;

            this.list[client_id].guild_list = {};

            this.list[client_id].leaveAllVoice = function() {
                const client = that.list[client_id];

                for (const guild of client.guilds.cache) {
                    //guild[0] = guild_id
                    //guild[1] = guild
                    if (!guild[1].members.cache.get(client.user.id).guild.voice) continue;     //Client is in no voice channel in this guild

                    const voice_channel = guild[1].members.cache.get(client.user.id).guild.voice.channel;
                    voice_channel.leave();  //After restart has to leave-join-leave to rly get out of channel dunno why
                    voice_channel.join();
                    voice_channel.leave();
                }
            };
        }

        db.init(true);
    }

    loadCommands(dir) {
        const commandFiles = fs.readdirSync(dir)
        	.filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
        	const command = require(path.join(dir, `${file}`));
            this.list.forEach(bot => {
                bot.commands.set(command.name, command);
            });
            consola.success(`Command >>\x1b[4m${command.name}\x1b[0m<< loaded!`);
        }
    }

    transferCommand(command, client_id) {
        /* Structure of command object
         * this.guild_id = params.guild_id
         * this.channel_id = params.channel_id;
         * this.message_id = params.message_id;
         * this.args = params.args;
         * this.command_name = params.command_name;
         */

        db.createCommand(command, client_id);
        this.executeCommand(command);
    }

    executeCommand(command) {
        var that = this;

        if (db.getExecutedOfCommand(command) == true) return;
        db.setExecutedOfCommand(command, true);

        var guild_id = command.guild_id;
        var command = db.getCommand(command);

        setTimeout(async function() {
            var heuristik_list = [];
            var highestHeuristik = -99999;
            var highestHeuristikClient;
            var message = null;


            for (const client_id of command.client_id_list) {
                let heuristik_id = heuristik_list.length;
                let client = null;

                //Get client matching client_id
                for (const _client of that.list) {
                    if (_client.user.id == client_id) {
                        client = _client;
                        break;  //break for loop when client is found
                    }
                }

                //get message matching message_id
                message = client.channels.cache.get(command.channel_id).messages.cache.get(command.message_id);

                //get heuristik for client
                heuristik_list[heuristik_id] = client.commands.get(command.command_name).getHeuristikForClient(message, command.args, client);


                //if heuristik for client than old highestHeuristik make heuristik new highestHeuristik
                if (highestHeuristik < heuristik_list[heuristik_id] || !heuristik_list[heuristik_id-1]) {
                    highestHeuristik = heuristik_list[heuristik_id];
                    highestHeuristikClient = client;
                }
            }

            console.log(highestHeuristikClient.user.username);
            highestHeuristikClient.commands.get(command.command_name).execute(message, command.args, highestHeuristikClient);
        }, 200);
    }
}


module.exports = BotManager;
