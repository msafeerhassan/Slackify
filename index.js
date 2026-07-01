require("dotenv").config();

const { App } = require("@slack/bolt")
const axios = require("axios")
const AI_BASE_URL = "https://ai.hackclub.com/proxy/v1"

const app = new App({
    token: process.env.BOT_TOKEN,
    appToken: process.env.APP_TOKEN,
    socketMode: true
});

app.command("/slackify-ping", async ({command, ack, respond}) => {
    const start = Date.now();
    await ack();
    const latency = Date.now() - start;
    await respond({
        text: `Ping Pong!\nLatency: ${latency}ms`
    });
});

app.command("/slackify-help", async ({ack, respond}) => {
    await ack();
    await respond({
        text: `
        Available Commands:
/slackify-ping - Checks bot latency
/slackify-help - For help regardings bot's commands
/slackify-catfact - Fetches a Cat Fact
/slackify-joke - Fetches a random joke
/slackify-tip - Fetches a random tip from HCAI
        `
    });
});

app.command("/slackify-catfact", async ({ack, respond}) => {
    await ack();

    try {
        const response = await axios.get("https://catfact.ninja/fact");
        await respond({
            text: `Cat Fact:\n${response.data.fact}`
        });
    }
    catch (err) {
        await respond({
            text: "Failed to fetch Cat Fact."
        });
    }
});

app.command("/slackify-joke", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
        await respond({
            text:
`${response.data.setup}

${response.data.punchline}`
        });
    } catch (err) {
        await respond({
            text: "Failed to fetch a joke :("
        });
    }
});

app.command("/slackify-tip", async ({ack, respond}) => {
    await ack()
    try {
        const response = await axios.post(
            `${AI_BASE_URL}/chat/completions`,
            {
                model: "qwen/qwen3-32b",
                messages: [
                    {
                        role: "user",
                        content: "Give me a short random tip - just text, no special characters etc."
                    }
                ],
                stream: false,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                    "Content-Type": "application/json"
                },
            }
        );

        await respond({
            text: response.data.choices[0].message.content
        });
    } catch (error) {
        await respond(`Error Fetching Tip from HCAI: ${error}`);
    }
});

(async () => {
    await app.start();
    console.log("bot is running!");
})();