const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const mongoose = require('mongoose');
const mongodb = require("../../config.json").mongodb;
const discordUsers = require('../../mongoSchemas/discordUsers');
const { link } = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
	.setName("introsound")
	.setDescription("Choose a sound you want to play when you enter a voice channel.")
    .addStringOption(option =>
        option.setName("link")
            .setDescription("Provide the link to the sound.")
            .setRequired(true)
    ),

    async execute(interaction, client) {
        const { options, member } = interaction;

        const link = options.getString("link");
        const isMP3 = link.slice(-4);

        const embed = new EmbedBuilder()

            if (isMP3 != ".mp3") {
                embed.setColor("Red").setDescription("You must give a valid link to a .mp3 file.");
                return interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                embed.setTitle("Introsound")
                embed.setColor("Purple")
                embed.addFields(
                    { name: "User", value: `${member}`, inline: true },
                    { name: "Introsound-link", value: `${link}`, inline: true },
                )
                embed.setTimestamp()    
            }        

        console.log("user = " + member);
        console.log("link = " + link);

        await mongoose.connect(mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        }).then(async (mongoose) => {
            try {
                const result = await discordUsers.findOneAndUpdate({
                
                    id: member.user.id,
                    }, {
                        user: member.user,
                        username: member.user.username,
                        introSound: link,
                    }, {
                        upsert: true,
                        new: true,
                    })
                } finally {
                    mongoose.connection.close();
                }
            })   
        
        try {
            const m = await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    }
}