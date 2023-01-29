const { REST, Routes } = require("discord.js");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.set(command.data.name, command);
        if (commandArray.length < 2){
          commandArray.push(command.data.toJSON());
        }
        
        console.log(commandArray)
        console.log(
          `Command: ${command.data.name} has been passed through the handler`
        );
      }
    }

    const clientId = "1068729005953519716";
    const guildID = "1068707904322011146";
    const rest = new REST({ version: "10" }).setToken(process.env.token);
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationGuildCommands(clientId, guildID), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
