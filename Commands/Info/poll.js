const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll and send it to a certain channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("description")
                .setDescription("What is the poll about?")
                .setRequired(true)
        )
        // 7 options just to make sure you always have enough options as Discord does not allow for incremental increase in fields while you're writing the message.
        .addStringOption(option =>
            option.setName("option1")
                .setDescription("Answer option nr 1")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option2")
                .setDescription("Answer option nr 2")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option3")
                .setDescription("Answer option nr 3")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option4")
                .setDescription("Answer option nr 4")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option5")
                .setDescription("Answer option nr 5")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option6")
                .setDescription("Answer option nr 6")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option7")
                .setDescription("Answer option nr 7")
                .setRequired(false)
        )
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Where do you want to send the poll?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction) {
        const { options } = interaction;
        const channel = options.getChannel("channel");
        const description = options.getString("description");
        const optionsArray = [];

        for (let i = 1; i <= 7; i++) {
            const option = options.getString(`option${i}`);
            if (option) optionsArray.push(option);
        }

        if (optionsArray.length === 0) {
            return interaction.reply({ content: "You need to provide at least one option.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setDescription(description)
            .addFields(optionsArray.map((opt, index) => ({ name: `Option ${index + 1}`, value: opt })))
            .setTimestamp();

        try {
            const message = await channel.send({ embeds: [embed] });
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];

            for (let i = 0; i < optionsArray.length; i++) {
                await message.react(emojis[i]);
            }

            await interaction.reply({ content: "Poll was successfully sent to the channel.", ephemeral: true });
        } catch (err) {
            console.log(err);
            await interaction.reply({ content: "An error occurred while trying to send the poll.", ephemeral: true });
        }
    }
};
