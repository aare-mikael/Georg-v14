const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("delete-channel")
    .setDescription("Delete a discord channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
        option.setName("channel")
        .setDescription("Setlect the channel you wanna delete.")
        .setRequired(true)
        ),

        async execute(interaction) {
            const { options } = interaction;

            const channel = options.getChannel("channel")

            channel.delete()

            await interaction.reply({ content: "The channel was successfully deleted.", ephemeral: true })
        }
}