// Events/Guild/join-to-create.js (CJS bootstrap)
const { ChannelType, PermissionsBitField, Collection } = require("discord.js");
const schema = require("../../Models/join-to-create");

module.exports = (client) => {
  const voiceOwnerByChannel = new Collection(); // channelId -> ownerUserId

  client.on("voiceStateUpdate", async (oldState, newState) => {
    // Ensure guild context
    const guild = newState.guild ?? oldState.guild;
    if (!guild) return;

    const data = await schema.findOne({ Guild: guild.id }).catch(() => null);
    if (!data) return;

    const hubChannel = client.channels.cache.get(data.Channel);
    if (!hubChannel || hubChannel.type !== ChannelType.GuildVoice) return;

    const member = newState.member ?? oldState.member;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // User joined the hub -> create private VC
    if (oldChannel !== newChannel && newChannel && newChannel.id === hubChannel.id) {
      // sanity: bot perms
      const me = guild.members.me;
      const needed = [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel];
      if (!me.permissions.has(needed)) {
        console.warn("[join-to-create] missing perms to create/move channel");
        return;
      }

      const vc = await guild.channels.create({
        name: `🔊 | ${member.user.tag}`,
        type: ChannelType.GuildVoice,
        parent: hubChannel.parent ?? undefined,
        userLimit: data.UserLimit ?? 0,
        permissionOverwrites: [
          { id: member.id, allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels] },
          { id: guild.id,   allow: [PermissionsBitField.Flags.Connect] },
        ],
      });

      voiceOwnerByChannel.set(vc.id, member.id);

      // Prevent hub rejoin loop for 30s
      await hubChannel.permissionOverwrites.edit(member, { Connect: false }).catch(() => {});
      setTimeout(() => hubChannel.permissionOverwrites.delete(member).catch(() => {}), 30_000);

      // move user into their room
      setTimeout(() => member.voice.setChannel(vc).catch(() => {}), 500);
      return;
    }

    // Owner left their room -> handover or delete
    if (oldChannel && voiceOwnerByChannel.has(oldChannel.id)) {
      const ownerId = voiceOwnerByChannel.get(oldChannel.id);
      const stillInRoom = oldChannel.members.filter(m => !m.user.bot);

      // If owner left and others remain, transfer ownership
      if (member.id === ownerId && (!newChannel || newChannel.id !== oldChannel.id)) {
        if (stillInRoom.size > 0) {
          const [next] = stillInRoom.random(1);
          voiceOwnerByChannel.set(oldChannel.id, next.id);
          oldChannel.setName(`🔊 | ${next.user.tag}`).catch(() => {});
          oldChannel.permissionOverwrites.edit(next, {
            Connect: true,
            ManageChannels: true, // lowercase boolean
          }).catch(() => {});
        } else {
          // empty: delete room
          voiceOwnerByChannel.delete(oldChannel.id);
          oldChannel.delete().catch(() => {});
        }
      }

      // If room became empty regardless of owner
      if (oldChannel.members.filter(m => !m.user.bot).size === 0) {
        voiceOwnerByChannel.delete(oldChannel.id);
        oldChannel.delete().catch(() => {});
      }
    }
  });

  // cleanup if a room is deleted externally
  client.on("channelDelete", (ch) => {
    if (ch.type === ChannelType.GuildVoice) voiceOwnerByChannel.delete(ch.id);
  });
};
