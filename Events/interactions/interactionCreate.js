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

      console.log(client.commands)

      console.log("Command:")
      console.log(command)

      // //moderation filter
      // if (command.moderatorOnly) {
      //   if (member.user.id !== "227520275132973056") {
      //     errEmbed.setDescription(
      //       "⛔ | Whoops! You don't have permissions for that!"
      //     );
      //     return interaction.reply({ embeds: [errEmbed], ephemeral: false });
      //   }
      // }

      // //admin filter
      // if (command.adminOnly) {
      //   if (member.user.id !== "227520275132973056") {
      //     errEmbed.setDescription(
      //       "⛔ | Whoops! You don't have permissions for that!"
      //     );
      //     return interaction.reply({ embeds: [errEmbed], ephemeral: false });
      //   }
      // }

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
