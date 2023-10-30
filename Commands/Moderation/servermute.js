const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("servermute")
        .setDescription("Server mute every member in your current voice channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("What is the reason of the mute?")
        ),

    async execute(interaction) {
        const { guild, member, options } = interaction;

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
        }

        const reason = options.getString("reason") || "No reason provided";

        const errEmbed = new EmbedBuilder()
            .setDescription('Something went wrong. Please try again later.')
            .setColor(0xc72c3b)

        const successEmbed = new EmbedBuilder()
            .setTitle("**:white_check_mark: Muted**")
            .setDescription(`Successfully servermuted users.`)
            .addFields(
                { name: "Reason", value: `${reason}`, inline: true },
            )
            .setColor(0x5fb041)
            .setTimestamp();

        try {
            const membersToMute = voiceChannel.members.filter(member => !member.user.bot);
            for (const memberToMute of membersToMute) {
                if (memberToMute[1].user.id === interaction.member.user.id) continue;
                if (!memberToMute[1].voice.muted) await memberToMute[1].voice.setMute(true);
            }       

            interaction.reply({ embeds: [successEmbed], ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}