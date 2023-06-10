const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get information about a user.")
    .addUserOption(option =>
        option.setName("user")
        .setDescription("Select a user.")
        .setRequired(false)
        ),

        async execute(interaction) {
            const { options } = interaction;
            const user = options.getUser("user") || interaction.user;
            const member = await interaction.guild.members.cache.get(user.id);
            const icon = user.displayAvatarURL()
            const tag = user.tag;

            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setAuthor({ name: tag, iconURL: icon })
            .addFields(
                { name: "Name", value: `${user}`, inline: false },
                { name: "Roles", value: `${member.roles.cache.map(r => r).join(`` )}`, inline: false },
                { name: "Joined server", value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: true },
                { name: "Joined discord", value: `<t:${parseInt(member.user.createdAt / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp()

            await interaction.reply({ embeds: [embed] })
        }
}