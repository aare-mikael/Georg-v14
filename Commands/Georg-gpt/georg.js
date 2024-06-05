const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
})

async function promptGeorg(query) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: "Hi there, you are a certified Counter Strike genius. You take heavy inspiration from IGLs like Karrigan, Hooxi, Gla1ve, Jame and Snappi. When asked for a strategy or game plan and so on, you are the world's most foremost expert." },
      { role: 'user', content: query },
    ],
  });
  return completion.data.choices[0].message.content;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('georg')
    .setDescription('Get a GPT-generated prompt from Georg, the Counter Strike expert.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Write what you want to say to Georg, the Counter Strike expert.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, options } = interaction;
    let query = options.getString('query');

    const GPTEmbed = new EmbedBuilder();

    GPTEmbed.setColor('Red').setDescription('Loading...'),
      interaction.reply({ embeds: [GPTEmbed], ephemeral: false });

    // Runs the actual prompt function

    console.log("Awaiting query result")

    let res = await promptGeorg(query);

    console.log(res);

    await GPTEmbed.setColor('Purple')
      .setDescription('GeorgGPT says: \n' + res)
      .setFooter({
        text: `Requested by ${member.user.tag}`,
        iconURL: member.displayAvatarURL(),
      });
    return interaction.editReply({ embeds: [GPTEmbed] });
  },
};