const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
const georgKey = process.env.georgGPT;

const configuration = new Configuration({
    apiKey: georgKey,
  });

const openai = new OpenAIApi(configuration);

async function promptGeorg(query) {
    try {
        const getResponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: 'testcontent'}],
            prompt: "Say this is a test",
            temperature: 0.7,
            max_tokens: 500
        });
        let answer = response.data.choices[0].message.content;
        console.log(answer);
        console.log(response)
        return answer;
    } catch (error) {
        console.log(error);
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
        const { member, options } = interaction ;
        let query = options.getString("query");

        const GPTEmbed = new EmbedBuilder()

        GPTEmbed
            .setColor("Red")
            .setDescription("Loading..."),
        interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

        // Runs the actual prompt function
        let result = await promptGeorg(query);
        console.log(result)

        GPTEmbed
            .setColor("Purple")
            .setDescription("GeorgGPT says: \n" + result)
            .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        return interaction.editReply({ embeds: [GPTEmbed] });
    }
};