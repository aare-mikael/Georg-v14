const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { OpenAI } = require('openai');
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
require("dotenv").config()
const token  = process.env.TOKEN

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

const addMessage = (threadId, content) => {
  return openai.beta.threads.messages.create(
    threadId, 
    { role: "user", content })
}

client.on('messageCreate', async message => {
  if(message.author.bot || !message.content || message.content === '') return;
  if (message.content.includes("georg") || message.content.includes("Georg")) {
    const discordThreadId = message.channel.id;
    let openAiThreadId = getOpenAiThreadId[discordThreadId];

    let messagesLoaded = false;
    if(!openAiThreadId) {
      const thread = await openai.beta.threads.create();
      openAiThreadId = thread.id;
      addThreadToMap(discordThreadId, openAiThreadId);
      if(message.channel.isThread()) {
        const starterMessage = await message.channel.fetchStarterMessage();
        const otherMessagesRaw = await message.channel.messages.fetch();

        const otherMessages = Array.from(otherMessagesRaw.values()).map(msg => msg.content).reverse();
        const messages = [starterMessage.content, ...otherMessages].filter(msg => !!msg && msg !== '');

        await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg.content)));
        messagesLoaded = true;
      }
    }

    if (!messagesLoaded) {
      await addMessage(openAiThreadId, message.content);
    }

    // await openai.beta.threads.messages.create(
    //   openAiThreadId,
    //   { role: "user", content: message.content }
    // )

    const run = await openai.beta.threads.runs.create(
      openAiThreadId,
      { assistant_id: process.env.GEORG_ASSISTANT_ID }
    );

    const status = await statusCheckLoop(openAiThreadId, run.id);

    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    let response = messages.data[0].content[0].text.value;
    response = response.substring(0, 1999) // Discord text limit

    console.log(messages.data);

    message.reply(response);
  }
})

client.login(token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
