const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } = require("@discordjs/voice");
const mongoose = require("mongoose");
const mongodb = require("../../config.json").mongodb;
const discordUsers = require("../../mongoSchemas/discordUsers");
const client = require("../../index");
const distube = require("distube");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldUser, newUser) {
    if (oldUser.channel != (null || undefined)) return;

    // Georg_v14
    if (newUser.id == '1089200999933169714') return;

    // Georg_v12
    if (newUser.id == '741703921877123164') return;

    const voiceChannel = newUser.channel;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
    }
    try {
      const user = await discordUsers.findOne({ id: newUser.id });
      if (user) {
        const introSound = user.introSound;
        if (introSound) {
          await client.distube.play(voiceChannel, introSound, { leaveOnStop: true, leaveOnFinish: true });
        }
      }
    } catch (err) {
      console.log(err);
      return;
    }
    return;
  },
};
