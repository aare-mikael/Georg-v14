// Handlers/commandHandler.js
const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

async function loadCommands(client) {
  const table = new ascii().setHeading("Command", "Status");
  const commandsArray = [];

  // Resolve the absolute Commands directory
  const baseDir = path.join(__dirname, "..", "Commands");
  const categories = fs.readdirSync(baseDir);

  for (const folder of categories) {
    const folderPath = path.join(baseDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    console.log(`Processing folder: ${folder}`);

    const files = fs
      .readdirSync(folderPath)
      .filter(f => f.endsWith(".js") || f.endsWith(".mjs") || f.endsWith(".cjs"));

    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const fullPath = path.join(folderPath, file);

      try {
        // ✅ Works for both CJS and ESM files (and ESM with top-level await)
        const mod = await import(pathToFileURL(fullPath).href);
        const commandFile = mod?.default ?? mod;

        if (!commandFile?.data || !commandFile?.data?.name) {
          table.addRow(`${folder}/${file}`, "missing 'data' or 'name' ❌");
          continue;
        }
        if (typeof commandFile.execute !== "function") {
          table.addRow(`${folder}/${file}`, "missing 'execute' ❌");
          continue;
        }

        // keep the folder info if you need it later
        const properties = { folder, ...commandFile };

        // warn on duplicates by name
        if (client.commands.has(commandFile.data.name)) {
          table.addRow(`${folder}/${file}`, `duplicate "${commandFile.data.name}" ❌`);
          continue;
        }

        client.commands.set(commandFile.data.name, properties);
        commandsArray.push(commandFile.data.toJSON());
        table.addRow(`${folder}/${file}`, "loaded ✅");
      } catch (err) {
        console.error(`[commandLoader] Failed: ${folder}/${file}`, err?.message || err);
        table.addRow(`${folder}/${file}`, "load error ❌");
      }
    }
  }

  if (commandsArray.length === 0) {
    console.error("No commands loaded, please check your command files.");
    console.log(table.toString());
    return;
  }

  // Register application commands (global). For dev you can set per-guild instead.
  try {
    await client.application.commands.set(commandsArray);
    console.log(table.toString(), `\nLoaded ${commandsArray.length} commands`);
  } catch (err) {
    console.error("[commandLoader] Failed to register application commands:", err?.message || err);
    console.log(table.toString());
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