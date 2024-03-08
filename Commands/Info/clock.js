const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clock")
        .setDescription("Write a message, send it to a text channel, Georg reacts with pre-defined emojis.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
        const { options } = interaction;

        const channel = options.getChannel("channel");
        const description = options.getString("description");

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setDescription(description)
            .setTimestamp();

        try {
            const m = await channel.send({ embeds: [embed] });
            m.react("🕢").then(() => m.react("🕗")).then(() => m.react("🕣")).then(() => m.react("🕘")).then(() => m.react("🕤")).then(() => m.react("🕙")).then(() => m.react("❌"));
            await interaction.reply({ content: "Poll was successfully sent to the channel.", ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}