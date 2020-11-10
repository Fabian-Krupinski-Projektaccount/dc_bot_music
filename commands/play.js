const Discord = require('discord.js');
const scdl = require('soundcloud-downloader');
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	getHeuristikForRunningCommand(message, args, client) {
		var heuristik = 0;


		var text_channel = message.channel;
		let voice_channel = message.member.voice.channel;

		if(!text_channel || !voice_channel) return -1;

		var text_permissions = text_channel.permissionsFor(message.client.user);
		var voice_permissions = voice_channel.permissionsFor(message.client.user);

		if (!text_permissions.has("VIEW_CHANNEL") && !text_permissions.has("SEND_MESSAGES") && !voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK") && !message.guild.me.hasPermission("ADMINISTRATOR")) {
			return -1
		}

		if (text_permissions.has("VIEW_CHANNEL") && text_permissions.has("SEND_MESSAGES") && voice_permissions.has("CONNECT") && voice_permissions.has("SPEAK") && !message.guild.me.hasPermission("ADMINISTRATOR")) {
			heuristik += 2;
		}

		if (message.guild.me.hasPermission("ADMINISTRATOR")) {
			heuristik += 1;
		}

		return heuristik;
	},
	async execute(message, args, client) {
		/*let text_channel = message.channel;
		let voice_channel = message.member.voice.channel;

		if(!text_channel || !voice_channel) return false;

		if (message.client.user.hasPermission('ADMINISTRATOR')) return true;

		var permissions = text_channel.permissionsFor(message.client.user);

		if (!permissions.has("VIEW_CHANNEL") || !permissions.has("SEND_MESSAGES")) return false;

		permissions = voice_channel.permissionsFor(message.client.user);

		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return false;

		return true;*/

        var channel = message.member.voice.channel;

        if ((client.guild_list[message.guild.id].voiceChannel != null) && (client.guild_list[message.guild.id].voiceChannel != channel)) {
            return message.reply(" I'm already in a voice channel!");
        }





        if (client.guild_list[message.guild.id].isPlaying == false && client.guild_list[message.guild.id].voiceChannel != null) {
            client.guild_list[message.guild.id].voiceChannel.leave();
            client.guild_list[message.guild.id].voiceChannel == null;
        }
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
