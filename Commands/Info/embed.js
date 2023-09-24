const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Write a message, Georg sends it in an embed to a text channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName("colour")
                .setDescription("Choose a colour for the embed.")
                .setRequired(false)
                .addChoices([
                    ["Red", "Red"],
                    ["Orange", "Orange"],
                    ["Yellow", "Yellow"],
                    ["Green", "Green"],
                    ["Blue", "Blue"],
                    ["Purple", "Purple"],
                    ["Pink", "Pink"],
                    ["Black", "Black"],
                    ["White", "White"]
                ])
        )                
            .addMentionableOption(option =>
            option.setName("tag")
                .setDescription("Which user/group do you want to mention?")
                .setRequired(false)
        )
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
        const { options } = interaction;

        const channel = options.getChannel("channel");
        const description = options.getString("description");

        const embed = new EmbedBuilder()
            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor(options.getString("colour") || "Purple")
            .setDescription(description)
            .setFields([{
                    name: "Channel",
                    value: channel.toString(),
                    inline: true
                }, {
                    name: "Author",
                    value: interaction.user.toString(),
                    inline: true
                }
            ])
            .setFooter("Georg", interaction.client.user.displayAvatarURL({ dynamic: true }))            
            .setTimestamp()
            .setTitle(options.getString("title"));

        try {
            const m = await channel.send({ embeds: [embed] });
            const tag = await channel.send({ content: options.getMentionable("tag") });
            
            await interaction.reply({ content: "Embed was successfully sent to the channel.", ephemeral: false });
        } catch (err) {
            console.log(err);
        }
    }
}