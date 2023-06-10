const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const { getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource  } = require('@discordjs/voice');
const mongoose = require('mongoose');
const mongodb = require("../../config.json").mongodb;
const discordUsers = require('../../mongoSchemas/discordUsers');

module.exports = {
    name: "voiceStateUpdate",
    async execute(oldUser, newUser) {

        if (oldUser.channel != (null || undefined)) return;
        
        // Georg_v14
        if (newUser.id == 1089200999933169714) return;

        // Georg
        if (newUser.id == 741703921877123164) return;

        joinVoiceChannel({
            channelId: newUser.channel.id,
            guildId: newUser.channel.guildId,
            adapterCreator: newUser.channel.guild.voiceAdapterCreator,
        })

        const sound = createAudioResource('C:/Users/Mikae/Downloads/y2mate-mp3cut_sRzY6rh(1).mp3')
        const player = createAudioPlayer();
        player.play(sound)

        const link = "";

        await mongoose.connect(mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        }).then(async (mongoose) => {
            try {
                const result = await discordUsers.findOne({
                
                    id: newUser.id,
                    }, {
                        user: newUser.user,
                        introSound: link,
                    }, {
                        upsert: true,
                        new: true,
                    })
                    // const sound = result.introSound;



                    // const resource = createAudioResource(sound);
                    // player.play(resource);


                    // voiceChannel.join().then(connection => {
                    // const dispatcher = connection.play(sound);

//                    client.distube.play(voiceChannel, query, { textChannel: channel, member: member });



//                    dispatcher.on('finish', () => voiceChannel.leave());
                } finally {
                    mongoose.connection.close();
                }
            })   

                // const sound = result.introSound;
                // const player = await createAudioPlayer(sound);

                return;
            }
    }
