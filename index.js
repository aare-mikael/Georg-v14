const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const { OpenAI } = require('openai');
const georgApiKey = process.env.GEORGGPT_APIKEY;
const georgAssistantId = process.env.GEORG_ASSISTANT_ID

const dotenv = require('dotenv').config()
const token  = process.env.TOKEN

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
client.config = require("./config.json");

module.exports = client;

const openai = new OpenAI({
  apiKey: georgApiKey,
});

const threadMap = {};

const getOpenAiThreadId = (discordThreadId) => {
  // Temporary in-memory solution until I can scale up with a database like Firestore, Redis or DynamoDB.
  return threadMap[discordThreadId];
}

const addThreadToMap = (discordThreadId, openAiThreadId) => {
  threadMap[discordThreadId] = openAiThreadId;
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const terminalStates = ["cancelled", "failed", "completed", "expired"];
const statusCheckLoop = async (openAiThreadId, runId) => {
  const run = await openai.beta.threads.runs.retrieve(
    openAiThreadId,
    runId
  );

  if(terminalStates.indexOf(run.status) < 0) {
    await sleep(1000);
    return statusCheckLoop(openAiThreadId, runId);
  }

  return run.status;
}

client.on('messageCreate', async message => {
  if(message.author.bot) return;
  if (message.content.toLowerCase.includes("georg")) {
    const discordThreadId = message.channel.id;
    let openAiThreadId = threadMap[discordThreadId];

    if(!openAiThreadId) {
      const thread = await openai.beta.threads.create();
      openAiThreadId = thread.id;
      addThreadToMap(discordThreadId, openAiThreadId);
    }

    await openai.beta.threads.messages,create(
      openAiThreadId,
      { role: "user", content: message.content }
    )

    const run = await openai.beta.threads.runs.create(
      openAiThreadId,
      { assistant_id: georgAssistantId }
    );

    await statusCheckLoop(openAiThreadId, run.id);

    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    const response = messages.data[0].content[0].text.value;

    console.log(response);

    message.channel.send(response);
  }
})

client.login(token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
