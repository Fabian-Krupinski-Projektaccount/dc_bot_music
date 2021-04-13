const Discord = require('discord.js');
const consola = require('consola')
const path = require('path');
const fs = require('fs-extra');

const Database = require('./database');
const db = new Database();

class Botpool {
    constructor() {
        this.bots = [];
        this.prefix = 'm!';
        this.name = 'Music Bot';
    }

    init(secrets) {
        var that = this;

        for (const secret of secrets) {
            const client_id = this.bots.length;

            this.bots[client_id] = new Discord.Client()

            this.bots[client_id].login(secret);
            this.bots[client_id].commands = new Discord.Collection();
            this.bots[client_id].prefix = this.prefix;
            this.bots[client_id].name = this.name;

            this.bots[client_id].guild_list = {};

            this.bots[client_id].leaveAllVoice = function() {
                const client = that.bots[client_id];

                for (var guild of client.guilds.cache) {
                    /*guild[0] = guild_id
                      guild[1] = guild*/
                    guild = guild[1];

                    //Leave all voice channels on start
                    if (!guild.members.cache.get(client.user.id).guild.voice) continue;
                    const voice_channel = guild.members.cache.get(client.user.id).guild.voice.channel;
                    voice_channel.leave();
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
            this.bots.forEach(bot => {
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
        db.createGuild(command.guild_id);
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


module.exports = Botpool;
