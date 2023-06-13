// https://discord.com/oauth2/authorize?client_id=1089200999933169714&permissions=27895812325111&scope=bot%20applications.commands

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("inviteMe")
    .setDescription("Get the link to add me to your server."),

    async execute(interaction) {

        const embed = new EmbedBuilder()

        embed
            .setColor("Purple")
            .setTitle("Invite me!")
            .setDescription("Click [here](https://discord.com/oauth2/authorize?client_id=1089200999933169714&permissions=27895812325111&scope=bot%20applications.commands) to invite me to your server!")

        interaction.reply({ embeds: [embed], ephemeral: true })
        return;
    }
}