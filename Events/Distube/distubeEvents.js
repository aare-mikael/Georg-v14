// Events/Distube/distubeEvents.js
const client = require("../../index.js");
const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

// ---------- safe sender ----------
function resolveTextChannel(qOrCh) {
  // Accept a Queue (with .textChannel) or a Channel/Message
  const ch = qOrCh?.textChannel ?? qOrCh?.channel ?? qOrCh;
  if (!ch?.isTextBased?.()) return null;
  if (ch.type === ChannelType.GuildForum) return null; // forum root cannot receive messages
  return ch;
}

async function safeSend(qOrCh, payload) {
  const ch = resolveTextChannel(qOrCh);
  if (!ch) return; // nowhere safe to send
  const me = ch.guild?.members?.me;
  if (!me?.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages)) return;

  try {
    if (typeof payload === "string") return await ch.send({ content: payload });
    return await ch.send(payload);
  } catch (e) {
    console.error("[safeSend]", e?.message);
  }
}

// ---------- helpers ----------
const status = (queue) =>
  `Volume: \`${queue?.volume ?? 100}%\` | Filter: \`${(queue?.filters?.names ?? []).join(", ") || "Off"}\` | Loop: \`${queue?.repeatMode ? (queue.repeatMode === 2 ? "All Queue" : "This Song") : "Off"}\` | Autoplay: \`${queue?.autoplay ? "On" : "Off"}\``;

// ---------- events ----------
client.distube
  .on("playSong", (queue, song) =>
    safeSend(queue, {
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `🎶 | Playing \`${song?.name ?? "Unknown"}\` - \`${song?.formattedDuration ?? "?"}\`\n` +
            `Requested by: ${song?.user ?? "Unknown"}\n${status(queue)}`
          ),
      ],
    })
  )
  .on("addSong", (queue, song) =>
    safeSend(queue, {
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `➕ | Added \`${song?.name ?? "Unknown"}\` - \`${song?.formattedDuration ?? "?"}\` to the queue by ${song?.user ?? "Unknown"}`
          ),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    safeSend(queue, {
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `📃 | Added \`${playlist?.name ?? "Playlist"}\` (${playlist?.songs?.length ?? 0} songs) to queue\n${status(queue)}`
          ),
      ],
    })
  )
  .on("finish", (queue) =>
    safeSend(queue, {
      embeds: [new EmbedBuilder().setColor("Green").setDescription("🏁 | Queue finished!")],
    })
  )
  .on("empty", (queue) =>  // v5 passes queue here
    safeSend(queue, {
      embeds: [new EmbedBuilder().setColor("Red").setDescription("⛔ | Voice channel is empty! Leaving...")],
    })
  )
  .on("searchNoResult", (message, query) =>
    safeSend(message?.channel ?? message, {
      embeds: [new EmbedBuilder().setColor("Red").setDescription(`⛔ | No result found for \`${query}\`!`)],
    })
  )
  .on("error", (channel, e) =>
    safeSend(channel, `⛔ | ${e?.message ?? String(e)}`) // don’t crash if channel is not sendable
  );