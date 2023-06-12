const { Client, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const config = require("../../config.json");
require("colors");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        
        await mongoose.connect(config.mongodb || '', {
            keepAlive: true,
        });

        if (mongoose.connect) {
            console.log('[+]'.green + ' MongoDB connection succesful.')
        }

        const activities = ["you", "Netflix", "your browsing history", "your status", "Gameflow", "your gameplay", "PST activities", "your commands", "Twitch", "your voice channel", "your messages", "YouTube", "your DMs", "your profile", "your permissions"];
        let i = 0;

        setInterval(() => client.user.setPresence({ activities: [{ name: activities[i++ % activities.length], type: ActivityType.Watching }] }), 30000);
        console.log(`[ONLINE]`.green + ` ${client.user.tag} is online in ${client.guilds.cache.size} servers! `);
    },
};