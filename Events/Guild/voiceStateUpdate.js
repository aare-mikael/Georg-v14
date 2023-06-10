const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const mongoose = require("mongoose");
const mongodb = require("../../config.json").mongodb;
const discordUsers = require("../../mongoSchemas/discordUsers");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldUser, newUser) {
    if (oldUser.channel != (null || undefined)) return;

    // Georg_v14
    if (newUser.id == 1089200999933169714) return;

    // Georg
    if (newUser.id == 741703921877123164) return;

    const resource = createAudioResource(
      "https://www.myinstants.com/media/sounds/lets-go_fIvYyAr.mp3",
      {
        inlineVolume: true,
      }
    );
    const connection = joinVoiceChannel({
      channelId: newUser.channel.id,
      guildId: newUser.channel.guild.id,
      adapterCreator: newUser.channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);
    /*
    await mongoose
      .connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .then(async (mongoose) => {
        try {
          const result = await discordUsers.findOne(
            {
              id: newUser.id,
            },
            {
              user: newUser.user,
              introSound: link,
            },
            {
              upsert: true,
              new: true,
            }
          );
        } finally {
          mongoose.connection.close();
        }
      });*/
    return;
  },
};
