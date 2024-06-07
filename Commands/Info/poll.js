const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll and send it to a certain channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Where do you want to send the poll?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Write the title.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("What is the poll about?")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option1")
                .setDescription("Answer option nr 1")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option2")
                .setDescription("Answer option nr 2")
                .setRequired(true)
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
        .addStringOption(option =>
            option.setName("option8")
                .setDescription("Answer option nr 8")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option9")
                .setDescription("Answer option nr 9")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("option10")
                .setDescription("Answer option nr 10")
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const { options } = interaction;
            const title = options.getString("title");
            const channel = options.getChannel("channel");
            const description = options.getString("description");
    
            const pollOptions = await options.data;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    
            let embed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle(title)
                .setDescription(description)
                .setTimestamp();

            for (let i = 0; i < pollOptions.length; i++) {
                let emoji = emojis[i];
                let pollOption = pollOptions[i+1];
                embed.addFields(
                    {
                        name: `Option ${emoji}: ${pollOption.value}`,
                        value: ' '
                    }
                )
            }
            const message = await channel.send({ embeds: [embed] });

            for (let i = 0; i < pollOptions.length; i++) {
                await message.react(emojis[i]);
            }

            await interaction.reply({ content: "Poll was successfully sent to the channel.", ephemeral: true });
        } catch (err) {
            console.log(err);
            await interaction.reply({ content: "An error occurred while trying to send the poll.", ephemeral: true });
        }
    }
};
