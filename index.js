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

module.exports = client;

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const terminalStates = ["cancelled", "queued", "failed", "completed", "expired"];
const statusCheckLoop = async (openAiThreadId, runId) => {
  let run;
  do {
    run = await openai.beta.threads.runs.retrieve(openAiThreadId, runId);
    console.log("Run status:", run.status);
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
  if (message.content.toLowerCase().includes("georg")) {
    try {
      console.log("Creating thread with OpenAI...");
      const thread = await openai.beta.threads.create();
      console.log("Thread created with ID:", thread.id);

      console.log("Adding message to thread...");
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message.content,
      });

      console.log("Starting assistant run with ID:", process.env.GEORG_ASSISTANT_ID);
      let run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: process.env.GEORG_ASSISTANT_ID,
      });

      console.log("Initial run status:", run.status);

      if (run.status !== "completed") {
        await statusCheckLoop(run.thread_id, run.id);
      }

      console.log("Run completed with status:", run.status);

      console.log("Fetching messages from thread...");
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      console.log("Messages received:", messages);

      // Log all message roles and contents
      messages.data.forEach(msg => {
        console.log(`Role: ${msg.role}, Content: ${JSON.stringify(msg.content)}`);
      });

      const assistantReply = messages.data.find(msg => msg.role === "assistant");
      if (assistantReply && assistantReply.content && assistantReply.content.length > 0) {
        await message.channel.send(assistantReply.content[0].text.value);
      } else {
        console.log("No response from assistant.");
        await message.channel.send("No response from assistant.");
      }
    } catch (error) {
      console.error("Error handling message:", error);
      await message.channel.send("There was an error processing your request.");
    }
  }
});

client.login(token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
