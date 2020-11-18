const Discord = require('discord.js');

module.exports = {
	name: 'help',
	aliases: ['h'],
	description: 'Display all commands and descriptions',
	getHeuristikForClient(message, args, client) {
		var heuristik = 0;


		/*
        ----------------------CHANNELS----------------------
        */
		const TEXT_CHANNEL = message.channel;

		if(!TEXT_CHANNEL) return -1;		//client cant see text channel


		/*
        ----------------------Permissions----------------------
        */
		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission('ADMINISTRATOR');

		if (!text_permissions.has('SEND_MESSAGES') && !is_admin) return -1;		//client hasn't all needed permissions
		if (text_permissions.has('SEND_MESSAGES') && !is_admin) heuristik += 2;	//client has all needed permissions
		if (is_admin) heuristik += 1;											//client is admin


		return heuristik;
	},
	execute(message, args, client) {
		/*
        ----------------------CHANNELS----------------------
        */
		const TEXT_CHANNEL = client.channels.cache.get(message.channel.id);


		/*
        ----------------------Permissions----------------------
        */
		const text_permissions = message.channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission('ADMINISTRATOR');

		if (!text_permissions.has('SEND_MESSAGES') && !is_admin) return message.author.send(`I don't have permission to send messages in this channel!`);


		//execute
		const commands = message.client.commands.array();

		var helpEmbed = new Discord.MessageEmbed()
			.setTitle(client.name + ' Help')
			.setDescription('List of all commands')
			.setColor('#F8AA2A');

		commands.forEach((cmd) => {
			helpEmbed.addField(
				`**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ''}**`,
				`${cmd.description}`,
				true
			);
		});

		helpEmbed.setTimestamp();

		return TEXT_CHANNEL.send(helpEmbed).catch(console.error);
	}
};
