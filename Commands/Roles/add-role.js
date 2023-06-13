const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("add-role")
    .setDescription("Add a role to a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option.setName("user")
        .setDescription("The user to add the role to.")
        .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
            .setDescription("The role to add to the user.")
            .setRequired(true)
            ),

            async execute(interaction, client) {
                const user = interaction.options.getUser("user");
                const role = interaction.options.getRole("role");
                const member = await interaction.guild.members.fetch(user.id);

                if (member.roles.cache.has(role.id)) {
                    const embed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(`User ${user} already has the role \`${role.name}\`.`)
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setFooter({ text: `Requested by ${interaction.user.tag}` })
                    .setTimestamp()
                    await interaction.reply({ embeds: [embed], ephemeral: false })
                    return;
                }

                try {
                    await interaction.guild.members.cache.get(user.id).roles.add(role)
                    const embed = new EmbedBuilder()
                    .setColor(role.color)
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`Successfully added role \`${role.name}\` to user \`${user.tag}\`.`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}` })
                    .setTimestamp()

                    await interaction.reply({ embeds: [embed], ephemeral: false })
                    } catch (error) {
                        console.error(error)
                        const embed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setFooter({ text: `Requested by ${interaction.user.tag}` })
                        .setTimestamp()
                        .setDescription(
                            `Failed to add role \`${role.name}\` to user \`${user.tag}\`.`
                        )
                        await interaction.reply({ embeds: [embed], ephemeral: false })
                    }
            }
}