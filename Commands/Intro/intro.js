const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } = require("@discordjs/voice");
const mongoose = require("mongoose");
const mongodb = require("../../config.json").mongodb;
const discordUsers = require("../../mongoSchemas/discordUsers");
const client = require("../../index");
const distube = require("distube");

module.exports = {
  name: "intro",
  async execute(interaction) {
    const { member, guild} = interaction;

    const voiceChannel = member.voice.channel;
    const userid = member.id;
    
    if (!voiceChannel) {
        embed.setColor("Red").setDescription("You must be in a voice channel to execute this command.");
        interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
        embed.setColor("Red").setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}>`);
        interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
    }
    try {
      const user = await discordUsers.findOne({ id: userid });
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