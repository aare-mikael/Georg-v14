const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("servermute")
        .setDescription("Server mute every member in your current voice channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option.setName("time")
                .setDescription("How long should the mute last?")
                .setRequired(true)
        )
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
    
        const time = options.getString("time");
        const milliseconds = ms(time);
        const convertedTime = milliseconds * 1000;
        const reason = options.getString("reason") || "No reason provided";

        const errEmbed = new EmbedBuilder()
            .setDescription('Something went wrong. Please try again later.')
            .setColor(0xc72c3b)

        const successEmbed = new EmbedBuilder()
            .setTitle("**:white_check_mark: Muted**")
            .setDescription(`Successfully servermuted users.`)
            .addFields(
                { name: "Reason", value: `${reason}`, inline: true },
                { name: "Duration", value: `${time}`, inline: true }
            )
            .setColor(0x5fb041)
            .setTimestamp();

        if (!convertedTime)
            return interaction.reply({ embeds: [errEmbed], ephemeral: false });

        try {
            const membersToMute = voiceChannel.members.filter(member => !member.user.bot);
            for (const memberToMute of membersToMute) {
                if (!memberToMute[1].voice.muted) await memberToMute[1].voice.setMute(true, "Servermuted by " + member.user.tag + " for " + time + " because: " + reason);
            }

            // After the timeout, unmute all members in the voice channel
            setTimeout(async () => {
                for (const member of membersToMute.values()) {
                    if (member.voice.muted) await member.voice.setMute(false, "Mute duration ended.");
                    }
                }, convertedTime);            

            interaction.reply({ embeds: [succesEmbed], ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}