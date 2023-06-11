const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState } = require("@discordjs/voice");
const mongoose = require("mongoose");
const mongodb = require("../../config.json").mongodb;
const discordUsers = require("../../mongoSchemas/discordUsers");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldUser, newUser) {
    if (oldUser.channel != (null || undefined)) return;

    // Georg_v14
    if (newUser.id == '1089200999933169714') return;

    // Georg_v12
    if (newUser.id == '741703921877123164') return;

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
          const resource = createAudioResource(introSound, { inlineVolume: true });
          const connection = joinVoiceChannel({
            channelId: newUser.channel.id,
            guildId: newUser.channel.guild.id,
            adapterCreator: newUser.channel.guild.voiceAdapterCreator,
          });

          const player = createAudioPlayer();
          connection.subscribe(player)
          player.play(resource)


          connection.on(VoiceConnectionStatus.Disconnected, async (oldUser, newUser) => {
            try {
              await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
              ]);
              // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
              // Seems to be a real disconnect which SHOULDN'T be recovered from
              connection.destroy();
            }
          });


        }
      }
    } catch (err) {
      console.log(err);
      return;
    }
    return;
  },
};
