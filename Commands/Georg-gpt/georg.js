const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const georgConfig = require("../../config.json");
const georgAPI = georgConfig.georgGPT;

const georg = new Configuration({
    apiKey: georgAPI,
  });
const openai = new OpenAIApi(georg);

async function promptGeorg (query) {
    const completion = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    query,
    max_tokens:4000
    });
    try {
        console.log(completion.data.choices[0].text);
        return completion.data.choices[0].text;
    } catch (err) {
        console.log(err);
    }
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
        const query = options.getString("query");

        const GPTEmbed = new EmbedBuilder()

        GPTEmbed
            .setColor("Red")
            .setDescription("loading..."),

        // Runs the actual prompt function
        await promptGeorg(query);

        GPTEmbed
            .setColor("Purple")
            .setDescription(promptGeorg)
            .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        return interaction.editReply({ embeds: [GPTEmbed] });
    }
};