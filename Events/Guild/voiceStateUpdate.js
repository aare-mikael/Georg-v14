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
    // TODO; "Få deg fiber Erik!"

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

          const queue = await client.distube.getQueue(voiceChannel);
          console.log("Queue: " + queue);
          const duration = queue.duration;
          console.log("Duration: " + duration);
          const mode = queue.repeatMode;
          console.log("Mode: " + mode);


          // // Finn queue
          // const queue = await client.distube.getQueue(voiceChannel);

          // // Sett avspilling til loop: queue
          // await queue.setRepeatMode(2);

          // sett relevant introlyd som siste element
          await client.distube.play(voiceChannel, introSound);

          // // lagre timestamp i noværande element - LATER
          // // TODO

          // // Finn lengden på queue, skip (queue-1)
          // const queueLength = queue.size;
          // await queue.skip(queueLength - 1);

          // // la queue begynne på nytt, og sett loop til off etter 30 sekunder
          // setTimeout(() => {
          //   queue.setRepeatMode(0);
          // }, 30000);
                    
          // // spol til timestamp lagret fra tidligare - LATER
          // // TODO

        }
      }
    } catch (err) {
      console.log(err);
      return;
    }
    return;
  },
};
