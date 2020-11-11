const Discord = require('discord.js');

module.exports = {
	name: "help",
	aliases: ["h"],
	description: "Display all commands and descriptions",
	getHeuristikForRunningCommand(message, args, client) {
		var heuristik = 0;


		const text_channel = message.channel;

		if(!text_channel) return -1;

		const text_permissions = text_channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) {
			return -1
		}

		if (text_permissions.has("SEND_MESSAGES") && !is_admin) {
			heuristik += 2;
		}

		if (is_admin) {
			heuristik += 1;
		}

		return heuristik;
	},
	execute(message, args, client) {
		//channels
		const text_channel = message.channel;

		//permissions
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) {
			return message.author.send("I don't have permission to send messages in this channel");
		}


		//execute
		var commands = message.client.commands.array();

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

		return text_channel.send(helpEmbed).catch(console.error);
	}
};
