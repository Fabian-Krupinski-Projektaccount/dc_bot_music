const Song = require('../util/Song');

const Discord = require('discord.js');

const scSearch = require('sc-searcher');
scSearch.init(process.env.SOUNDCLOUD_CLIENT_ID);
const scdl = require('soundcloud-downloader');

const {YTSearcher} = require('ytsearcher');
const ytSearch = new YTSearcher(process.env.YOUTUBE_API_KEY);
const ytdl = require('ytdl-core');

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Starts playing or enqueues a song",
	getHeuristikForClient(message, args, client) {
		//If no guild_list exists create one
		if (!client.guild_list[message.guild.id]) {
            client.guild_list[message.guild.id] = {
                connection: null,
                volume: 5,
                queue: [],
                isPlaying: false
            };
        }

		//Set voiceChannel in guild_list.voiceChannel to null when client is in no voice.channel
		if (client.guild_list[message.guild.id].connection != null) {		//Only run when connection isn't already null
			let client_voice = client.guilds.cache.get(message.guild.id).members.cache.get(client.user.id).guild.voice;
			if (!client_voice || !client_voice.channel) {
				client.guild_list[message.guild.id].connection.channel = null;
			}
		}

		var heuristik = 0;

		//channels
        if(!message.member.voice) return -1;
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
		if (!client.guild_list[message.guild.id].connection.channel) {
			console.log(client.guild_list[message.guild.id]);
		} else {
			console.log(client.guild_list[message.guild.id].connection.channel.id);
		}
		console.log("------------");*/

		//already in another voice channel
		if (client.guild_list[message.guild.id].connection != null && client.guild_list[message.guild.id].connection.channel.id != VOICE_CHANNEL.id) return -1;

		//already in same voice channel
		if (client.guild_list[message.guild.id].connection != null && client.guild_list[message.guild.id].connection.channel.id == VOICE_CHANNEL.id) heuristik += 100000;

		//in no voice channel
		if (client.guild_list[message.guild.id].connection == null) heuristik += 50000;

		return heuristik;
	},
	async execute(message, args, client) {
		//channels
		const TEXT_CHANNEL = message.channel;
		const VOICE_CHANNEL = client.channels.cache.get(message.member.voice.channel.id);

		//requirements
		if(!message.member.voice) return message.reply(" You need to join a voice channel first!");

		const text_permissions = TEXT_CHANNEL.permissionsFor(message.client.user);
		const voice_permissions = message.member.voice.channel.permissionsFor(message.client.user);
		const is_admin = message.guild.me.hasPermission("ADMINISTRATOR");

		if (!text_permissions.has("SEND_MESSAGES") && !is_admin) return message.author.send("I don't have permission to send messages in this channel!");
		if ((!voice_permissions.has("CONNECT") || !voice_permissions.has("SPEAK")) && (!is_admin)) return message.reply(" I don't have permission to connect or speak in your voice channel!");

        if (client.guild_list[message.guild.id].connection != null && client.guild_list[message.guild.id].connection.channel != VOICE_CHANNEL) return message.reply(" all clients are already in voice channels!");

        if (!args[0]) return message.reply(" parameter for query missing!");


        if (client.guild_list[message.guild.id].connection == null) {
            client.guild_list[message.guild.id].connection = await VOICE_CHANNEL.join();
            /*console.log("------set voiceChannel------");
            console.log(client.user.username);
            console.log(client.guild_list[message.guild.id].connection.channel.id);
            console.log("------------");*/
            client.guild_list[message.guild.id].connection.voice.setSelfDeaf(true);
        }


        var connection = client.guild_list[message.guild.id].connection;
        var song_list = [];

        if (args[0].includes('youtube.com/') || args[0].includes('youtu.be/')) {
            console.log('Yt');
            if (args[0].includes('/playlist')) {

                console.log('Playlist');


            } else if (args[0].includes('/watch')) {
                song_list.push(new Song(args[0],Song.type[0]));
                console.log('Video');


            }


        } else if (args[0].includes('soundcloud.com/')) {
            console.log('Sc');
            if (args[0].includes('/sets/')) {

                console.log('Playlist');


            } else {
                song_list.push(new Song(args[0],Song.type[1]));
                console.log('Song');


            }


        } else {
            //search
        }




        for (const song of song_list) {
            client.guild_list[message.guild.id].queue.push(song);
        }
        play(message.guild.id, client);


	}
};

async function play(guild_id, client) {
    var stream = null;
    var song = client.guild_list[guild_id].queue[0];

    if (song.type == Song.type[0]) {
        stream = await ytdl(song.url);
    } else if (song.type == Song.type[1]) {
        stream = await scdl.download(song.url, process.env.SOUNDCLOUD_CLIENT_ID);
    }

    //console.log(stream);

    client.guild_list[guild_id].connection
        .play(stream)
        .on("finish", () => {
            client.guild_list[guild_id].queue.shift();
            play(guild_id, client);
        });
}
