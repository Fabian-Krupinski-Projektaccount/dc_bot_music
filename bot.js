require('dotenv').config()

const Command = require('./include/command');
const BotManager = require('./include/botManager');
const bot_manager = new BotManager();

const path = require('path');



bot_manager.init([
    process.env.DISCORD_BOT_TOKEN0,
    process.env.DISCORD_BOT_TOKEN1,
    process.env.DISCORD_BOT_TOKEN2,
    process.env.DISCORD_BOT_TOKEN3
]);
bot_manager.loadCommands(path.join(__dirname, 'commands'));

/*
----------------------CLIENT EVENTS----------------------
*/
bot_manager.list.forEach(client => {
    client.on('ready', () => {
        consola.ready(`Bot >>${client.user.tag}<<`);

        client.leaveAllVoice();

        setInterval(function() {
            client.user.setPresence({
                activity: {
                    name: `m!help on ${client.guilds.cache.size} server/s`, type: 'PLAYING'
                },
                status: 'online'
            })
        }, 3000);
    });



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

        var command_object = new Command({
            guild_id: guild_id,
            channel_id: channel_id,
            message_id: message_id,
            args: args,
            command_name: command.name
        });
        bot_manager.transferCommand(command_object, client_id);
    });
});
