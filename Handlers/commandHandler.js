function loadCommands(client) {
  const ascii = require("ascii-table");
  const fs = require("fs");
  const table = new ascii().setHeading("Commands", "Status");

  let commandsArray = [];

  const commandsFolder = fs.readdirSync("./Commands");
  for (const folder of commandsFolder) {
    console.log(`Processing folder: ${folder}`)
    const commandFiles = fs
      .readdirSync(`./Commands/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      console.log(`Processing file: ${file}`)
      const commandFile = require(`../Commands/${folder}/${file}`);

      if (commandFile.data && commandFile.data.name) {
        const properties = { folder, ...commandFile };
        client.commands.set(commandFile.data.name, properties);
  
        commandsArray.push(commandFile.data.toJSON());
  
        table.addRow(file, "loaded");
      } else {
        table.addRow(file, "missing 'data' or 'name' property", "❌");
      }
    }
  }

  if (commandsArray.length > 0) {
    client.application.commands.set(commandsArray);
    console.log(table.toString(),`\nLoaded ${commandsArray.length} commands`);
  } else {
    console.error("No commands loaded, please check your command files");
  }
}

module.exports = { loadCommands };
