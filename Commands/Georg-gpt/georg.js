const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
const georgKey = process.env.georgGPT;

const axiosClient = axios.create({
    headers: {
        Authorization: "Bearer " + georgKey,
    },
});

async function promptGeorg(query) {
    
    const params = {
        prompt: "Say this is a test",
        model: "gpt-3.5-turbo",
        max_tokens: 100,
        temperature: 0,
        object: "chat.completion",
    };

    axiosClient
        .post("https://api.openai.com/v1/completions", params)
        .then((result) => {
            console.log(result.data.choices[0].text);
        }).catch((err) => {
            console.log(err);
        });

    let result = response.data.choices[0].text;
    return result;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("georg")
        .setDescription("Get a GPT-generated prompt from Georg")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Write what you want to say to Georg.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { member, options } = interaction;
        let query = options.getString("query");

        const GPTEmbed = new EmbedBuilder()

        GPTEmbed
            .setColor("Red")
            .setDescription("loading..."),
        interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

        // Runs the actual prompt function
        const result = await promptGeorg(query);

        GPTEmbed
            .setColor("Purple")
            .setDescription(result)
            .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        return interaction.editReply({ embeds: [GPTEmbed] });
    }
};