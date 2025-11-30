// Commands/Music/play.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const client = require("../../index");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addStringOption(o =>
      o.setName("query").setDescription("Provide the name or URL for the song.").setRequired(true)
    ),

  async execute(interaction) {
    const { options, member, guild, channel } = interaction;
    const query = options.getString("query");
    const vc = member.voice.channel;

    // Always ack first so editReply is legal
    await interaction.deferReply({ ephemeral: false });

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() })
      .setDescription("Loading...");

    await interaction.editReply({ embeds: [embed] });

    // Must be in a VC
    if (!vc) {
      embed.setDescription("You must be in a voice channel to execute music commands.");
      return interaction.editReply({ embeds: [embed] });
    }

    // If the bot is already in another VC in this guild, block
    const botVcId = guild.members.me.voice.channelId;
    if (botVcId && botVcId !== vc.id) {
      embed.setDescription("I’m already playing in another voice channel in this server.");
      return interaction.editReply({ embeds: [embed] });
    }

    // Permissions check
    const perms = vc.permissionsFor(guild.members.me);
    if (!perms?.has(PermissionsBitField.Flags.Connect) || !perms?.has(PermissionsBitField.Flags.Speak)) {
      embed.setDescription("I’m missing **Connect**/**Speak** in that voice channel.");
      return interaction.editReply({ embeds: [embed] });
    }

    try {
      await client.distube.play(vc, query, {
        member,                          // give DisTube context
        textChannel: channel,            // guarantees queue.textChannel for event embeds
      });

      embed.setColor("Green").setDescription("🎶 Request received. Check the now-playing embed.");
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      embed.setColor("Red").setDescription(`⛔ ${err?.message ?? "Something went wrong..."}`);
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
