const Discord = require('discord.js');

module.exports = {
	name: "help",
	aliases: ["h"],
	description: "Display all commands and descriptions",
	getHeuristikForClient(message, args, client) {
		var heuristik = 0;

		//channels
		const TEXT_CHANNEL = message.channel;

		//client cant see text channel
		if(!TEXT_CHANNEL) return -1;

		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		//client hasn't all needed permissions
		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) return -1;

		//client has all needed permissions
		if (text_permissions.has("SEND_MESSAGES") && !is_admin) heuristik += 2;

		//client is admin
		if (is_admin) heuristik += 1;

		return heuristik;
	},
	execute(message, args, client) {
		//channels
		const TEXT_CHANNEL = message.channel;
		//requirements
		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) return message.author.send("I don't have permission to send messages in this channel!");


		//execute
		const commands = message.client.commands.array();

		var helpEmbed = new Discord.MessageEmbed()
			.setTitle(client.name + " Help")
			.setDescription("List of all commands")
			.setColor("#F8AA2A");

		commands.forEach((cmd) => {
			helpEmbed.addField(
				`**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
				`${cmd.description}`,
				true
			);
		});

		helpEmbed.setTimestamp();

		return TEXT_CHANNEL.send(helpEmbed).catch(console.error);
	}
};
