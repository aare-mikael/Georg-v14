const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { OpenAI } = require('openai');
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
require("dotenv").config();
const token = process.env.TOKEN;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials),
});

client.distube = new DisTube(client, {
  directLink: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  leaveOnEmpty: false,
  leaveOnFinish: true,
  leaveOnStop: true,
  plugins: [new SpotifyPlugin()],
});

client.commands = new Collection();
client.config = require("./config.json");

const channelThreads = new Map();

module.exports = client;

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const terminalStates = ["cancelled", "queued", "failed", "completed", "expired"];
const statusCheckLoop = async (openAiThreadId, runId) => {
  let run;
  do {
    run = await openai.beta.threads.runs.retrieve(openAiThreadId, runId);
    if (terminalStates.indexOf(run.status) < 0) {
      await sleep(1000);
    }
  } while (terminalStates.indexOf(run.status) < 0);

  return run.status;
};

const addMessage = (threadId, content) => {
  return openai.beta.threads.messages.create(threadId, { role: "user", content });
};

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content || message.content === '') return;
  if (message.content.toLowerCase().includes("georg") || message.mentions.client) {
    try {
      let threadId = channelThreads.get(message.channel.id);
      
      if (!threadId) {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;
        channelThreads.set(message.channel.id, threadId);
      }

      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message.content,
      });

      let run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.GEORG_ASSISTANT_ID,
      });

      if (run.status !== "completed") {
        await statusCheckLoop(run.thread_id, run.id);
      }

      if (run.status === 'failed') {
        await message.channel.send("The assistant run failed. Please try again later.");
        return;
      }

      const messages = await openai.beta.threads.messages.list(run.thread_id);

      const assistantReply = messages.data.find(msg => msg.role === "assistant");
      if (assistantReply && assistantReply.content && assistantReply.content.length > 0) {
        const replyContent = assistantReply.content[0].text.value;
        await message.channel.send(replyContent);
      } else {
        await message.channel.send("Georg is ignoring you.");
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        await message.channel.send("You've used up the quota, meaning Mikaels bank account is empty. Please contact Mikael.");
      } else {
        console.error("Error handling message:", error);
        await message.channel.send("There was an error processing your request.");
      }
    }
  }
});

client.login(token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
