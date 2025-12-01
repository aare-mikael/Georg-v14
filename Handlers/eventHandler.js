// Handlers/eventHandler.js
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function loadModule(fullPath, isMJS) {
  try {
    return isMJS ? await import(pathToFileURL(fullPath).href) : require(fullPath);
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      return await import(pathToFileURL(fullPath).href);
    }
    throw err;
  }
}

function asCommon(mod) {
  return mod?.default ?? mod; // normalize ESM/CJS
}

function isEvent(x) {
  return x && typeof x.name === 'string' && typeof x.execute === 'function';
}

function isBootstrapFn(x) {
  return typeof x === 'function';
}

function isBootstrapObj(x) {
  return x && (typeof x.init === 'function' || typeof x.setup === 'function');
}

async function loadEvents(client) {
  const baseDir = path.join(__dirname, '..', 'Events');
  const categories = fs.readdirSync(baseDir);
  let loadedEvents = 0, bootstrapped = 0, skipped = 0;

  for (const dir of categories) {
    const dirPath = path.join(baseDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs'));

    for (const file of files) {
      const full = path.join(dirPath, file);
      const isMJS = file.endsWith('.mjs');

      try {
        const mod = await loadModule(full, isMJS);
        const exp = asCommon(mod);

        if (isEvent(exp)) {
          if (exp.once) client.once(exp.name, (...a) => exp.execute(...a, client));
          else client.on(exp.name, (...a) => exp.execute(...a, client));
          loadedEvents++;
          continue;
        }

        if (isBootstrapFn(exp)) {
          await exp(client);
          bootstrapped++;
          continue;
        }

        if (isBootstrapObj(exp)) {
          await (exp.init ?? exp.setup).call(exp, client);
          bootstrapped++;
          continue;
        }

        skipped++;
        console.warn(`[eventLoader] Skipping ${dir}/${file} — missing name/execute and no bootstrap shape`);
      } catch (e) {
        skipped++;
        console.error(`[eventLoader] Failed ${dir}/${file}: ${e.message}`);
      }
    }
  }

  console.log(`[eventLoader] events: ${loadedEvents}, bootstraps: ${bootstrapped}, skipped: ${skipped}`);
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