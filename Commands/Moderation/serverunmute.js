const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverunmute")
        .setDescription("Disable server mute for every member in your current voice channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const { guild, member, options } = interaction;

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
        }

        const errEmbed = new EmbedBuilder()
            .setDescription('Something went wrong. Please try again later.')
            .setColor(0xc72c3b)

        const successEmbed = new EmbedBuilder()
            .setTitle("**:white_check_mark: Unmuted**")
            .setDescription(`Successfully turned off servermute for users in your voicechannel.`)
            .setColor(0x5fb041)
            .setTimestamp();

        try {
            voiceChannel.members.filter(member => !member.user.bot).each(async (memberToCheck) => {
                await memberToCheck.voice.setMute(false);
            });

            interaction.reply({ embeds: [successEmbed], ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}