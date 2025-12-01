// Handlers/eventHandler.js
const { readdirSync } = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function loadEvents(client) {
  const base = path.join(__dirname, '..', 'Events');
  const categories = readdirSync(base);

  for (const dir of categories) {
    const files = readdirSync(path.join(base, dir)).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const full = path.join(base, dir, file);
      // ✅ import ESM/CJS safely
      const mod = await import(pathToFileURL(full).href);
      const event = mod.default ?? mod; // ESM default or CJS module.exports

      if (!event?.name || typeof event.execute !== 'function') continue;

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