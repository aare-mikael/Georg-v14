// TO DO: Spør Andreas om andre tips

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const georgConfig = require("../../config.json");

const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  })

async function promptGeorg (query) {
    const completion = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    prompt: query,
    max_tokens:4000
    });
    console.log(completion.data.choices[0].text);
    return completion.data.choices[0].text;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("voicerecognition")
        .setDescription("Just a placeholder for now, don't use this command"),
    async execute(interaction) {
        interaction.reply("This command is not ready yet, please wait for a future update.");
    }
};