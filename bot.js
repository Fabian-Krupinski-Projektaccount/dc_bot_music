const Discord = require('discord.js');
const consola = require('consola')
const path = require('path');
const fs = require('fs-extra');


require('dotenv').config()

const Command = require('./include/command');
const BotPool = require('./include/botpool');

const botpool = new BotPool();



botpool.init([
    process.env.DISCORD_BOT_TOKEN0,
    process.env.DISCORD_BOT_TOKEN1,
    process.env.DISCORD_BOT_TOKEN2,
    process.env.DISCORD_BOT_TOKEN3
]);
botpool.loadCommands(path.join(__dirname, 'commands'));

/*
----------------------CLIENT EVENTS----------------------
*/
botpool.bots.forEach(bot => {
    bot.on('ready', async () => {
        consola.ready(`Bot >>${bot.user.tag}<<`);

        bot.leaveAllVoice();

        setInterval(function() {
            bot.user.setPresence({
                activity: {
                    name: `m!help on ${bot.guilds.cache.size} server/s`, type: 'PLAYING'
                },
                status: 'online'
            })
        }, 3000);
    });



    bot.on('message', async message => {
        /*
        ----------------------VARIABLES----------------------
        */
        const guild_id = message.guild.id;
        const channel_id = message.channel.id;
        const message_id = message.id;


        /*
        ----------------------CHECK IF MESSAGE IS VALID COMMAND----------------------
        */
    	if (message.author.bot) return;
    	if (!message.content.startsWith(bot.prefix)) return;

    	const args = message.content.slice(bot.prefix.length).trim().split(/ +/g);
    	const commandName = args.shift().toLowerCase();

        const command =
    		bot.commands.get(commandName) ||
    		bot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));


    	if (!command) return;


        /*
        ----------------------RUN----------------------
        */
        botpool.execute(new Command({
            guild_id: guild_id,
            channel_id: channel_id,
            message_id: message_id,
            command_name: command.name,
            args: args
        }), bot.user.id);
    });
});
