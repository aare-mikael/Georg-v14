const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const {
      member,
      commandName,
    } = interaction;

    const errEmbed = new EmbedBuilder().setColor("Red");

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(commandName);

      if (!command) {
        return interaction.reply({
          content: "outdated command",
          ephemeral: false,
        });
      }

      command.execute(interaction, client);
    }
  },
};
