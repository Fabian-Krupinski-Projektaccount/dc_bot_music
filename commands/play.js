const Discord = require('discord.js');
const scsearch = require('soundcloud-searcher');
var scopts = {
	limit: 5,
	name: 'witcher3'
};
scsearch.init(process.env.SOUNDCLOUD_CLIENT_ID)
const scdl = require('soundcloud-downloader');
const ytsearch = require('youtube-search');
const ytopts = {
    maxResults: 5,
    key: process.env.YOUTUBE_API_KEY
};
const ytdl = require('ytdl-core');

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	getHeuristikForClient(message, args, client) {
		//If no guild_list exists create one
		if (!client.guild_list[message.guild.id]) {
            client.guild_list[message.guild.id] = {
                voiceChannel: null,
                volume: 5,
                music: {
                    queue: new Map(),
                    isPlaying: false
                }
            };
        }

		//Set voiceChannel in guild_list.voiceChannel to null when client is in no voice.channel
		if (client.guild_list[message.guild.id].voiceChannel != null) {		//Only run when voiceChannel isn't already null
			let client_voice = client.guilds.cache.get(message.guild.id).members.cache.get(client.user.id).guild.voice;
			if (!client_voice || !client_voice.channel) {
				client.guild_list[message.guild.id].voiceChannel = null;
			}
		}

		var heuristik = 0;

		//channels
		const TEXT_CHANNEL = message.channel;
		const VOICE_CHANNEL = client.channels.cache.get(message.member.voice.channel.id);

		//client cant see text or voice channel
		if(!TEXT_CHANNEL || !VOICE_CHANNEL) return -1;

		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const voice_permissions = VOICE_CHANNEL.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		//client hasn't all needed permissions
		if (!text_permissions.has("SEND_MESSAGES") && !voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK") && !is_admin) return -1;

		//client has all needed permissions
		if (text_permissions.has("SEND_MESSAGES") && voice_permissions.has("CONNECT") && voice_permissions.has("SPEAK") && !is_admin) heuristik += 2;

		//client is admin
		if (is_admin) heuristik += 1;

		/*console.log("------read voiceChannel------");
		console.log(client.user.username);
		if (!client.guild_list[message.guild.id].voiceChannel) {
			console.log(client.guild_list[message.guild.id]);
		} else {
			console.log(client.guild_list[message.guild.id].voiceChannel.id);
		}
		console.log("------------");*/

		//already in another voice channel
		if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel.id != VOICE_CHANNEL.id) return -1;

		//already in same voice channel
		if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel.id == VOICE_CHANNEL.id) heuristik += 100000;

		//in no voice channel
		if (client.guild_list[message.guild.id].voiceChannel == null) heuristik += 50000;

		return heuristik;
	},
	async execute(message, args, client) {
		//channels
		const TEXT_CHANNEL = message.channel;
		const VOICE_CHANNEL = client.channels.cache.get(message.member.voice.channel.id);

		//requirements
		if(!message.member.voice || !message.member.voice.channel) return message.reply(" You need to join a voice channel first!");

		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const voice_permissions = message.member.voice.channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) return message.author.send("I don't have permission to send messages in this channel!");
		if ((!voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK")) && (!is_admin)) return message.reply(" I don't have permission to connect or speak in your voice channel!");

        if (client.guild_list[message.guild.id].voiceChannel != null && client.guild_list[message.guild.id].voiceChannel != VOICE_CHANNEL) return message.reply(" all clients are already in voice channels!");


        if (client.guild_list[message.guild.id].voiceChannel == null) {
            VOICE_CHANNEL.join()
				.then(connection => {
					client.guild_list[message.guild.id].voiceChannel = connection.channel;
					/*console.log("------set voiceChannel------");
					console.log(client.user.username);
					console.log(client.guild_list[message.guild.id].voiceChannel.id);
					console.log("------------");*/
					connection.voice.setSelfDeaf(true);
				});
        }
	}
};
