const Discord = require('discord.js');

module.exports = {
	name: "help",
	aliases: ["h"],
	description: "Display all commands and descriptions",
	isExecutable(message, args, client) {
		let text_channel = message.channel;

		if(!text_channel) return false;

		var permissions = text_channel.permissionsFor(message.client.user);

		if (!permissions.has("VIEW_CHANNEL") || !permissions.has("SEND_MESSAGES")) return false;

		return true;
	},
	execute(message, args, client) {
		if(!this.isExecutable(message, args, client)) return;

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
