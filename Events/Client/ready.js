// Events/Client/ready.js
const mongoose = require('mongoose');
const config = require('../../config.json');
const { ActivityType } = require('discord.js');

const ROTATE_MS = 3 * 60 * 1000;

// Build reverse lookup for logs
const ActivityNameByValue = Object.fromEntries(
  Object.entries(ActivityType).map(([k, v]) => [v, k])
);

const ACTIVITIES = [
  { name: 'you',                    type: ActivityType.Watching },
  { name: '/play',                  type: ActivityType.Listening },
  { name: 'music',                  type: ActivityType.Playing },
  { name: 'queues',                 type: ActivityType.Competing },
  { name: 'your browsing history',  type: ActivityType.Watching },
  { name: 'your status',            type: ActivityType.Watching },
  { name: 'your commands',          type: ActivityType.Watching },
  { name: 'your voice channel',     type: ActivityType.Listening },
  { name: 'YouTube',                type: ActivityType.Watching },
  { name: 'Twitch',                 type: ActivityType.Watching },
];

const ICON = {
  [ActivityType.Watching]:  '👀',
  [ActivityType.Listening]: '🎧',
  [ActivityType.Playing]:   '🎮',
  [ActivityType.Competing]: '🏁',
};

// If you also want the literal verb in the text, flip this to true.
const VERB_IN_NAME = true;

function labelFor(a) {
  if (!VERB_IN_NAME) return `${ICON[a.type] ?? ''} ${a.name}`.trim();
  const verb = {
    [ActivityType.Watching]:  'watching',
    [ActivityType.Listening]: 'listening to',
    [ActivityType.Playing]:   'playing',
    [ActivityType.Competing]: 'competing in',
  }[a.type];
  return `${ICON[a.type] ?? ''} ${verb} ${a.name}`.trim();
}

// Fisher–Yates
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function applyPresence(client, a) {
  await client.user.setPresence({ status: 'online', activities: [{ name: labelFor(a), type: a.type }] });
  const now = client.user.presence?.activities?.[0];
  console.log('[presence]', now?.type, `"${now?.name}"`);
}

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    
    try {
    // DB connect
    await mongoose.connect(config.mongodb);
    const c = mongoose.connection;
    console.log(`[+] MongoDB connected: ${c.host}/${c.name} (state=${c.readyState})`);
} catch (e) {
    console.error('[MongoDB] connection error:', e.message);
    process.exit(1);
}

    // Clear any old rotator
    if (client.presenceTimer) clearInterval(client.presenceTimer);

    // Prepare randomized rotation
    let rotation = shuffle(ACTIVITIES);
    let idx = 0;

    // Initial presence
    try {
      await applyPresence(client, rotation[idx++]);
    } catch (e) {
      console.error('[presence:set]', e?.message || e);
    }

    // Rotate; reshuffle when exhausted
    client.presenceTimer = setInterval(async () => {
      try {
        if (idx >= rotation.length) {
          rotation = shuffle(ACTIVITIES);
          idx = 0;
        }
        await applyPresence(client, rotation[idx++]);
      } catch (e) {
        console.error('[presence:rotate]', e?.message || e);
      }
    }, ROTATE_MS);

    console.log(`[ONLINE] ${client.user.tag} is online in ${client.guilds.cache.size} servers!`);
  },
};
