const Discord = require("discord.js");

module.exports = {
	name: "help",
	aliases: ["h"],
	description: "Display all commands and descriptions",
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
