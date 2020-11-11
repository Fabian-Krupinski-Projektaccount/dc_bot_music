const Discord = require('discord.js');
const scdl = require('soundcloud-downloader');
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	getHeuristikForRunningCommand(message, args, client) {
		var heuristik = 0;


		const text_channel = message.channel;
		const voice_channel = message.member.voice.channel;

		if(!text_channel || !voice_channel) return -1;

		const text_permissions = text_channel.permissionsFor(message.client.user);
		const voice_permissions = voice_channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK") && !is_admin) {
			return -1
		}

		if (text_permissions.has("SEND_MESSAGES") && voice_permissions.has("CONNECT") && voice_permissions.has("SPEAK") && !is_admin) {
			heuristik += 2;
		}

		if (is_admin) {
			heuristik += 1;
		}

		return heuristik;
	},
	async execute(message, args, client) {
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
            client.guild_list[message.guild.id].voiceChannel =  await channel.join()
				.then(connection => {
					connection.voice.setSelfDeaf(true);
				});
        }
        console.log(message.member.voice.channelID);
        channel.join();
        client.guild_list[message.guild.id].voiceChannel = channel;
        if (client.guild_list[message.guild.id].voiceChannel != null && message.member.voice.channelID == client.guild_list[message.guild.id].voiceChannel.id) {
            console.log(client.guild_list[message.guild.id].voiceChannel.id);
        }
	}
};
