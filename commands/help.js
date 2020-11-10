const Discord = require('discord.js');

module.exports = {
	name: "help",
	aliases: ["h"],
	description: "Display all commands and descriptions",
	getHeuristikForRunningCommand(message, args, client) {
		var heuristik = 0;


		var text_channel = message.channel;

		if(!text_channel) return -1;

		var text_permissions = text_channel.permissionsFor(message.client.user);

		if (!text_permissions.has("VIEW_CHANNEL") && !text_permissions.has("SEND_MESSAGES") && !message.guild.me.hasPermission("ADMINISTRATOR")) {
			return -1
		}

		if (text_permissions.has("VIEW_CHANNEL") && text_permissions.has("SEND_MESSAGES") && !message.guild.me.hasPermission("ADMINISTRATOR")) {
			heuristik += 2;
		}

		if (message.guild.me.hasPermission("ADMINISTRATOR")) {
			heuristik += 1;
		}

		return heuristik;
	},
	execute(message, args, client) {
		let commands = message.client.commands.array();

		let helpEmbed = new Discord.MessageEmbed()
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

		return message.channel.send(helpEmbed).catch(console.error);
	}
};
