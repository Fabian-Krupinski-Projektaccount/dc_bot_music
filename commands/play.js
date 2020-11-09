const Discord = require('discord.js');
const scdl = require('soundcloud-downloader');
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	execute(message, args, client) {
        var channel = message.member.voice.channel;

        if (!channel) {
            return message.reply(" you need to be in a voice channel!");
        }

        if ((client.guild_list[message.guild.id].voiceChannel != null) && (client.guild_list[message.guild.id].voiceChannel != channel)) {
            return message.reply(" I'm already in a voice channel!");
        }

        var permissions = voiceChannel.permissionsFor(message.client.user);

        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.reply(", I need the permissions to join and speak in your voice channel!");
        }





        if (client.guild_list[message.guild.id].isPlaying == false && client.guild_list[message.guild.id].voiceChannel != null) {
            client.guild_list[message.guild.id].voiceChannel.leave();
            client.guild_list[message.guild.id].voiceChannel == null;
        }
        if (client.guild_list[message.guild.id].voiceChannel == null) {

            channel.join();
        }
        console.log(message.member.voice.channelID);
        const channel = client.channels.cache.get(message.member.voice.channelID);
        channel.join();
        client.guild_list[message.guild.id].voiceChannel = channel;
        if (client.guild_list[message.guild.id].voiceChannel != null && message.member.voice.channelID == client.guild_list[message.guild.id].voiceChannel.id) {
            console.log(client.guild_list[message.guild.id].voiceChannel.id);
        }
	}
};
