const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const os = require('os');
const { getVoiceConnections } = require('@discordjs/voice');

function tryRequire(p) { try { return require(p); } catch { return null; } }
function fmtMs(ms) {
  const s = Math.floor(ms/1000)%60, m = Math.floor(ms/60000)%60, h = Math.floor(ms/3600000)%24, d = Math.floor(ms/86400000);
  const pad = n => String(n).padStart(2, '0');
  return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
}
function fmtBytes(b) {
  if (!b && b !== 0) return 'n/a';
  const u = ['B','KB','MB','GB','TB']; let i = 0; while (b >= 1024 && i < u.length-1) { b/=1024; i++; }
  return `${b.toFixed(1)} ${u[i]}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Show bot health & diagnostics')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const client = interaction.client;

    // Always defer first; then we can safely editReply no matter what happens.
    const t0 = Date.now();
    await interaction.deferReply({ ephemeral: true }).catch(() => {});
    const apiLatency = Date.now() - t0;

    // Versions
    const versions = {
      node: process.version,
      discordjs: tryRequire('discord.js/package.json')?.version ?? 'n/a',
      distube:   tryRequire('distube/package.json')?.version ?? 'n/a',
      ytdlp:     tryRequire('@distube/yt-dlp/package.json')?.version ?? 'n/a',
      voice:     tryRequire('@discordjs/voice/package.json')?.version ?? 'n/a',
      openai:    tryRequire('openai/package.json')?.version ?? 'n/a',
    };

    // Pings
    const wsPing = Math.round(client.ws.ping);
    let mongoState = mongoose.connection?.readyState ?? 0; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    let mongoPing = 'n/a';
    try {
      if (mongoState === 1) {
        const t1 = Date.now();
        await mongoose.connection.db.admin().ping();
        mongoPing = `${Date.now() - t1} ms`;
      }
    } catch { /* leave as n/a */ }

    // Process stats
    const mem = process.memoryUsage();
    const rss = fmtBytes(mem.rss);
    const heap = `${fmtBytes(mem.heapUsed)} / ${fmtBytes(mem.heapTotal)}`;
    const uptime = fmtMs(process.uptime() * 1000);

    // Music + scope
    const voiceConns = getVoiceConnections()?.size ?? 0;
    const queues = (client.distube?.queues?.size ?? client.distube?.queues?.collection?.size ?? 0);
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('Georg — Health')
      .addFields(
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'WS Ping', value: `${wsPing} ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency} ms`, inline: true },

        { name: 'Memory', value: `RSS ${rss}\nHeap ${heap}`, inline: true },
        { name: 'Mongo', value: `state=${mongoState} ping=${mongoPing}`, inline: true },
        { name: 'Music', value: `Queues ${queues}\nVoice conns ${voiceConns}`, inline: true },

        { name: 'Scope', value: `Guilds ${guilds}\nUsers (cache) ${users}`, inline: true },
        { name: 'Versions',
          value:
            `Node ${versions.node}\n` +
            `discord.js ${versions.discordjs}\n` +
            `DisTube ${versions.distube}\n` +
            `@distube/yt-dlp ${versions.ytdlp}\n` +
            `@discordjs/voice ${versions.voice}\n` +
            `openai ${versions.openai}` }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] }).catch(() => {});
  }
};
