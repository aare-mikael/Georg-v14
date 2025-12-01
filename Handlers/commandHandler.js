// Handlers/commandHandler.js
const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

async function loadCommands(client) {
  const table = new ascii().setHeading("Command", "Status");
  const commandsArray = [];
  const baseDir = path.join(__dirname, "..", "Commands");

  const categories = fs.readdirSync(baseDir);
  for (const folder of categories) {
    const folderPath = path.join(baseDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs
      .readdirSync(folderPath)
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
          catch (e2) {
            table.addRow(`${folder}/${file}`, "import failed ❌");
            console.error(`[commandLoader] import failed ${folder}/${file}:`, e2.message);
            continue;
          }
        } else {
          table.addRow(`${folder}/${file}`, "load error ❌");
          console.error(`[commandLoader] load failed ${folder}/${file}:`, err.message);
          continue;
        }
      }

      const commandFile = mod?.default ?? mod;
      if (!commandFile?.data?.name || typeof commandFile.execute !== "function") {
        table.addRow(`${folder}/${file}`, "missing data/execute ❌");
        continue;
      }

      if (client.commands.has(commandFile.data.name)) {
        table.addRow(`${folder}/${file}`, `duplicate "${commandFile.data.name}" ❌`);
        continue;
      }

      client.commands.set(commandFile.data.name, { folder, ...commandFile });
      commandsArray.push(commandFile.data.toJSON());
      table.addRow(`${folder}/${file}`, "loaded ✅");
    }
  }

  if (!commandsArray.length) {
    console.error("No commands loaded.");
    console.log(table.toString());
    return;
  }

  try {
    await client.application.commands.set(commandsArray);
    console.log(table.toString(), `\nLoaded ${commandsArray.length} commands`);
  } catch (e) {
    console.error("[commandLoader] register failed:", e.message);
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