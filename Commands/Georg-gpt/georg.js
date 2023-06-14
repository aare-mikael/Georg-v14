const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const georgConfig = require("../../config.json");
const georgAPI = georgConfig.georgGPT;

const configuration = new Configuration({
    apiKey: georgAPI,
  });
const openai = new OpenAIApi(configuration);

async function promptGeorg (query) {
    const completion = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        query,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    try {
        const answer = response.data.choices[0].text;
        console.log(answer);
        // return answer;
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
        interaction.reply({ embeds: [embed], ephemeral: false });

        // Runs the actual prompt function
        const result = await promptGeorg(query);

        GPTEmbed
            .setColor("Purple")
            .setDescription(result)
            .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        return interaction.editReply({ embeds: [GPTEmbed] });
    }
};