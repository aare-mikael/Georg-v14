const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const isTTY = process.stdout.isTTY;

async function loadCommands(client) {
  const table = new ascii().setHeading("Command", "Status");
  const commandsArray = [];
  const baseDir = path.join(__dirname, "..", "Commands");
  const categories = fs.readdirSync(baseDir);
  let ok = 0, bad = 0;

  for (const folder of categories) {
    const folderPath = path.join(baseDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith(".js") || f.endsWith(".mjs") || f.endsWith(".cjs"));

    for (const file of files) {
      const full = path.join(folderPath, file);
      const isMJS = file.endsWith(".mjs");
      let mod;

      try {
        mod = isMJS ? await import(pathToFileURL(full).href) : require(full);
      } catch (err) {
        if (err.code === "ERR_REQUIRE_ESM") {
          try { mod = await import(pathToFileURL(full).href); }
          catch (e2) { bad++; table.addRow(`${folder}/${file}`, "import failed ❌"); continue; }
        } else { bad++; table.addRow(`${folder}/${file}`, "load error ❌"); continue; }
      }

      const command = mod?.default ?? mod;
      if (!command?.data?.name || typeof command.execute !== "function") {
        bad++; table.addRow(`${folder}/${file}`, "missing data/execute ❌"); continue;
      }
      if (client.commands.has(command.data.name)) {
        bad++; table.addRow(`${folder}/${file}`, `duplicate "${command.data.name}" ❌`); continue;
      }

      client.commands.set(command.data.name, { folder, ...command });
      commandsArray.push(command.data.toJSON());
      ok++; table.addRow(`${folder}/${file}`, "loaded ✅");
    }
  }

  if (!commandsArray.length) {
    if (isTTY) console.log(table.toString());
    console.error("No commands loaded.");
    return;
  }

  await client.application.commands.set(commandsArray);

  // Print once, at the end, in a single write
  if (isTTY) {
    console.log(table.toString(), `\nLoaded ${ok} commands (${bad} skipped)`);
  } else {
    console.log(`Loaded ${ok} commands (${bad} skipped)`);
  }
}

module.exports = { loadCommands };




/*
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
*/