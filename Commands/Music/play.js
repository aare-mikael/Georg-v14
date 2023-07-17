const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const client = require("../../index");
const distube = require("distube");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song.")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Provide the name or url for the song.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { options, member, guild, channel } = interaction;

        const query = options.getString("query");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        embed
            .setColor("Red")
            .setDescription(`Loading...`)
            // .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() }),
        interaction.reply({ embeds: [embed], ephemeral: false });

        if (!voiceChannel) {
            embed.setColor("Red").setDescription("You must be in a voice channel to execute music commands.");
            interaction.editReply({ embeds: [embed], ephemeral: false });
            return;
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed.setColor("Red").setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}>`);
            interaction.editReply({ embeds: [embed], ephemeral: false });
            return;
        }

        try {

            await client.distube.play(voiceChannel, query, { textChannel: channel, member: member }, { leaveOnStop: true, leaveOnEmpty: false, leaveOnFinish: true, autoPlay: false });
            embed.setColor("Green").setDescription("🎶 Request received.");
            interaction.editReply({ embeds: [embed], ephemeral: false });
            return;

        } catch (err) {
            console.log(err);

            embed.setColor("Red").setDescription("⛔ | Something went wrong...");
            interaction.editReply({ embeds: [embed], ephemeral: false });
            return;
        }
    }
}