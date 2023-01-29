const autoComplete = require("../../data/autocomplete.js").autocomplete;

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      let options = await autoComplete(interaction);

      options = options.splice(0, 25);

      await interaction
        .respond(
          options.map((name) => {
            return {
              name: name,
              value: name,
            };
          })
        )
        .catch((error) => {
          console.error(
            `Error responding to /${interaction.commandName} command autocomplete require for locale ${interaction.locale}: ${error}`
          );
        });
    }
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: `Something went wrong while executing this command... `,
          ephemeral: true,
        });
      }
    }
  },
};
