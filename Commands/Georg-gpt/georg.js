const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require('dotenv').config();
const georgKey = process.env.georgGPT;

const configuration = new Configuration({
    apiKey: georgKey,
  });
const openai = new OpenAIApi(configuration);

async function promptGeorg(query) {
    const response = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        query,
        usage: {
            prompt_tokens: 100,
            completion_tokens: 800,
            total_tokens: 1000,
        },
        temperature: 2,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    const answer = response.data.choices[0].text;
    console.log(answer);
    return answer;
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
        console.log(typeof query);

        console.log(georgKey);

        const GPTEmbed = new EmbedBuilder()

        GPTEmbed
            .setColor("Red")
            .setDescription("loading..."),
        interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

        // // Runs the actual prompt function
        // const result = await promptGeorg(query);

        // GPTEmbed
        //     .setColor("Purple")
        //     .setDescription(result)
        //     .setFooter({ text: `Requested by ${member.user.tag}`, iconURL: member.displayAvatarURL() });
        // return interaction.editReply({ embeds: [GPTEmbed] });
    }
};