const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const dotenv = require('dotenv').config()

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");

const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)],
});

client.distube = new DisTube(client, {
  directLink: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  leaveOnEmpty: false,
  leaveOnFinish: true,
  leaveOnStop: true,
  plugins: [new SpotifyPlugin()]
});

client.commands = new Collection();
client.config = dotenv.token;

module.exports = client;

client.login().then(() => {
  loadEvents(client);
  loadCommands(client);
});
