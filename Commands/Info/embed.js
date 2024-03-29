const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Write a message, Georg sends it in an embed to a text channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Write the title.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("Write the message.")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Which channel do you want to send the message to?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction) {
        const { options, member } = interaction;

        const channel = options.getChannel("channel");
        const description = options.getString("description");

        const embed = new EmbedBuilder()
            .setColor("Purple")
            .setDescription(description)
            .setFooter({
                text: `Written by ${member.user.tag}`,
                iconURL: member.displayAvatarURL(),
              })
            .setTimestamp()
            .setTitle(options.getString("title"));

        try {
            const m = await channel.send({ embeds: [embed] });
            
            await interaction.reply({ content: "Embed was successfully sent to the channel.", ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}