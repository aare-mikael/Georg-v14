// Events/Distube/distubeEvents.js (CJS bootstrap)
const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

function resolveTextChannel(qOrCh) {
  const ch = qOrCh?.textChannel ?? qOrCh?.channel ?? qOrCh;
  if (!ch?.isTextBased?.()) return null;
  if (ch.type === ChannelType.GuildForum) return null;
  return ch;
}

async function safeSend(qOrCh, payload) {
  const ch = resolveTextChannel(qOrCh);
  if (!ch) return;
  const me = ch.guild?.members?.me;
  if (!me?.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages)) return;
  try {
    return typeof payload === "string" ? ch.send({ content: payload }) : ch.send(payload);
  } catch (e) { console.error("[safeSend]", e?.message); }
}

const status = (q) =>
  `Volume: \`${q?.volume ?? 100}%\` | Filter: \`${(q?.filters?.names ?? []).join(", ") || "Off"}\` | Loop: \`${q?.repeatMode ? (q.repeatMode === 2 ? "All Queue" : "This Song") : "Off"}\` | Autoplay: \`${q?.autoplay ? "On" : "Off"}\``;

module.exports = (client) => {
  if (!client?.distube) {
    console.warn("[distubeEvents] client.distube missing; skipping listeners");
    return;
  }

  client.distube
    .on("playSong", (queue, song) =>
      safeSend(queue, {
        embeds: [new EmbedBuilder().setColor("Green")
          .setDescription(`🎶 | Playing \`${song?.name ?? "Unknown"}\` - \`${song?.formattedDuration ?? "?"}\`\nRequested by: ${song?.user ?? "Unknown"}\n${status(queue)}`)],
      })
    )
    .on("addSong", (queue, song) =>
      safeSend(queue, {
        embeds: [new EmbedBuilder().setColor("Green")
          .setDescription(`➕ | Added \`${song?.name ?? "Unknown"}\` - \`${song?.formattedDuration ?? "?"}\` by ${song?.user ?? "Unknown"}`)],
      })
    )
    .on("addList", (queue, playlist) =>
      safeSend(queue, {
        embeds: [new EmbedBuilder().setColor("Green")
          .setDescription(`📃 | Added \`${playlist?.name ?? "Playlist"}\` (${playlist?.songs?.length ?? 0} songs)\n${status(queue)}`)],
      })
    )
    .on("finish", (queue) =>
      safeSend(queue, { embeds: [new EmbedBuilder().setColor("Green").setDescription("🏁 | Queue finished!")] })
    )
    .on("empty", (queue) =>
      safeSend(queue, { embeds: [new EmbedBuilder().setColor("Red").setDescription("⛔ | Voice channel is empty! Leaving...")] })
    )
    .on("searchNoResult", (message, query) =>
      safeSend(message?.channel ?? message, { embeds: [new EmbedBuilder().setColor("Red").setDescription(`⛔ | No result found for \`${query}\`!`)] })
    )
    .on("error", (channel, e) => safeSend(channel, `⛔ | ${e?.message ?? String(e)}`));
};
