// Handlers/eventHandler.js
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function loadEvents(client) {
  const baseDir = path.join(__dirname, '..', 'Events');
  const categories = fs.readdirSync(baseDir);

  for (const dir of categories) {
    const dirPath = path.join(baseDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    const files = fs
      .readdirSync(dirPath)
      .filter(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs'));

    for (const file of files) {
      const full = path.join(dirPath, file);
      let mod;

      try {
        // ✅ Try CommonJS first to avoid ESM reparse warnings on CJS files
        mod = require(full);
      } catch (err) {
        // If the file is true ESM or has top-level await, require() will fail;
        // fall back to dynamic import.
        if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_REQUIRE_ASYNC_MODULE') {
          mod = await import(pathToFileURL(full).href);
        } else {
          console.error(`[eventLoader] require failed for ${dir}/${file}:`, err.message);
          continue;
        }
      }

      const event = mod?.default ?? mod;
      if (!event?.name || typeof event.execute !== 'function') {
        console.warn(`[eventLoader] Skipping ${dir}/${file} — missing name/execute`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
}

module.exports = { loadEvents };


/*
function loadEvents(client) {
    const ascii = require('ascii-table');
    const fs = require('fs');
    const table = new ascii().setHeading('Events', 'Status');

    const folders = fs.readdirSync('./Events');
    for (const folder of folders) {
        const files = fs.readdirSync(`./Events/${folder}`).filter((file) => file.endsWith(".js"));

        for (const file of files) {
            const event = require(`../Events/${folder}/${file}`);

            if (event.rest) {
                if(event.once)
                    client.rest.once(event.name, (...args) =>
                    event.execute(...args, client)
                );
                else
                    client.rest.on(event.name, (...args) =>
                        event.execute(...args, client)
                    );
            } else {
                if (event.once)
                    client.once(event.name, (...args) => event.execute(...args, client));
                else client.on(event.name, (...args) => event.execute(...args, client));
            }
            table.addRow(file, "loaded");
            continue;
        }
    }
    return console.log(table.toString(), "\nLoaded events");
}

module.exports = {loadEvents};
*/