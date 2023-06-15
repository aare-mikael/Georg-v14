const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const georgKey = process.env.georgGPT;

const configuration = new Configuration({
  apiKey: georgKey,
});

const openai = new OpenAIApi(configuration);

async function promptGeorg(query) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: "You are a close friend of mine, where we are comfortable with saying toxic things to each other and roasting each other, because we know it's all jokes" },
      { role: 'user', content: query },
    ],
  });
  return completion.data.choices[0].message.content;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('georg')
    .setDescription('Get a GPT-generated prompt from Georg')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Write what you want to say to Georg.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, options } = interaction;
    let query = options.getString('query');

    const GPTEmbed = new EmbedBuilder();

    GPTEmbed.setColor('Red').setDescription('Loading...'),
      interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

    // Runs the actual prompt function

    let res = await promptGeorg(query);

    await GPTEmbed.setColor('Purple')
      .setDescription('GeorgGPT says: \n' + res)
      .setFooter({
        text: `Requested by ${member.user.tag}`,
        iconURL: member.displayAvatarURL(),
      });
    return interaction.editReply({ embeds: [GPTEmbed] });
  },
};
