const Discord = require('discord.js');
const scdl = require('soundcloud-downloader');
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	isExecutable(message, args, client) {
		let text_channel = message.channel;
		let voice_channel = message.member.voice.channel;

		if(!text_channel || !voice_channel) return false;

		var permissions = text_channel.permissionsFor(message.client.user);

		if (!permissions.has("VIEW_CHANNEL") || !permissions.has("SEND_MESSAGES")) return false;

		permissions = voice_channel.permissionsFor(message.client.user);

		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return false;

		return true;
	},
	async execute(message, args, client) {
		if(!this.isExecutable(message, args, client)) return;

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
