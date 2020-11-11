const Discord = require('discord.js');
const scdl = require('soundcloud-downloader');
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	getHeuristikForRunningCommand(message, args, client) {
		if (!message.guild.voiceConnection) {
			client.guild_list[message.guild.id].voiceChannel = null;
		}

		var heuristik = 0;


		const text_channel = message.channel;
		const voice_channel = message.member.voice.channel;

		if(!text_channel || !voice_channel) return -1;

		const text_permissions = text_channel.permissionsFor(message.client.user);
		const voice_permissions = voice_channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK") && !is_admin) return -1;

		if (text_permissions.has("SEND_MESSAGES") && voice_permissions.has("CONNECT") && voice_permissions.has("SPEAK") && !is_admin) heuristik += 2;

		if (is_admin) heuristik += 1;


		if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel != voice_channel) return -1;

		if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel == voice_channel) heuristik += 100000;

		if (client.guild_list[message.guild.id].voiceChannel == null) heuristik += 50000;


		return heuristik;
	},
	async execute(message, args, client) {
		if (!message.guild.voiceConnection) {
			client.guild_list[message.guild.id].voiceChannel = null;
		}

		//channels
		const text_channel = message.channel;
		const voice_channel = message.member.voice.channel;

		//requirements
		if(!voice_channel) return message.reply(" You need to join a voice channel first!");

		const text_permissions = text_channel.permissionsFor(message.client.user);
		const voice_permissions = voice_channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) return message.author.send("I don't have permission to send messages in this channel!");
		if ((!voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK")) && (!is_admin)) return message.reply(" I don't have permission connect or speak in your voice channel!");

        if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel != voice_channel) return message.reply(" I'm already in a voice channel!");


        if (client.guild_list[message.guild.id].voiceChannel == null) {
            client.guild_list[message.guild.id].voiceChannel = await voice_channel.join()
				.then(connection => {
					console.log(client.guild_list[message.guild.id].voiceChannel);
					console.log("----------------------------------------------------");
					connection.voice.setSelfDeaf(true);
				});
			console.log(voice_channel);
			console.log("----------------------------------------------------");
			console.log(client.guild_list[message.guild.id].voiceChannel);
        }
	}
};
