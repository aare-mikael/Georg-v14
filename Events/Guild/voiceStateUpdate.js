const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const mongoose = require("mongoose");
const mongodb = require("../../config.json").mongodb;
const discordUsers = require("../../mongoSchemas/discordUsers");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldUser, newUser) {
    if (oldUser.channel != (null || undefined)) return;

    // Georg_v14
    if (newUser.id == 1089200999933169714) return;

    // Georg_v12
    if (newUser.id == 741703921877123164) return;
    
    if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        });
    }
        try {
            const user = await discordUsers.findOne({id: newUser.id});
            if (user) {
              const introSound = user.introSound;
              if (introSound) {
              const resource = createAudioResource(introSound, { inlineVolume: true });
              const connection = joinVoiceChannel({
                channelId: newUser.channel.id,
                guildId: newUser.channel.guild.id,
                adapterCreator: newUser.channel.guild.voiceAdapterCreator,
              });
      
              const player = createAudioPlayer();
              connection.subscribe(player);
              player.play(resource);
              player.on("error", console.error);
            }
            }
        } catch (err) {
            console.log(err);
            return;
        } 
    return;
  },
};
