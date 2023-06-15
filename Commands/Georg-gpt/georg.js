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
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            // messages: [{ query }],
            messages: [{role: 'user', content: 'testcontent'}],
            prompt: "Say this is a test",
            // usage: {
            //     prompt_tokens: 100,
            //     completion_tokens: 800,
            //     total_tokens: 1000,
            // },
            // temperature: 1,
            // top_p: 1,
            // frequency_penalty: 0,
            // presence_penalty: 0,
        });
        console.log(response.data.choices[0].message.content);
        let answer = response.data.choices[0].message.content.toString();
        console.log(answer);
        return answer;
    } catch (error) {
        console.error(error);
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
        let query = options.getString("query");

        const GPTEmbed = new EmbedBuilder()

        GPTEmbed
            .setColor("Red")
            .setDescription("Loading..."),
        interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

        // Runs the actual prompt function
        let result = await promptGeorg(query);

        GPTEmbed
            .setColor("Purple")
            .setDescription("The result: \n " + result)
            .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        return interaction.editReply({ embeds: [GPTEmbed] });
    }
};