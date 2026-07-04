require("dotenv").config();

const { App } = require("@slack/bolt")
const axios = require("axios");
const AI_BASE_URL = "https://ai.hackclub.com/proxy/v1"

const app = new App({
    token: process.env.BOT_TOKEN,
    appToken: process.env.APP_TOKEN,
    socketMode: true
});

app.use(async ({command, client, next}) => {
    if (command && command.command) {
        try {
            const argText = command.text ? ` ${command.text}` : "";
            await client.chat.postMessage({
                channel: command.channel_id,
                text: `<@${command.user_id}> ran \`${command.command}\`${argText}`
            });
        } catch (error) {
            console.error("Failed to post command announcement:", error)
        }
    }

    await next();
})

app.command("/slackify-catfact", async ({ack, respond}) => {
    await ack();

    try {
        const response = await axios.get("https://catfact.ninja/fact");
        await respond({
            response_type: "in_channel",
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
            response_type: "in_channel",
            text: `${response.data.setup}\n\n${response.data.punchline}`
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
            response_type: "in_channel",
            text: response.data.choices[0].message.content
        });
    } catch (error) {
        await respond({
            text: `Error Fetching Tip from HCAI: ${error}`
    });
    }
});

app.command("/slackify-quote", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://dummyjson.com/quotes/random");
        const {quote, author} = response.data;

        await respond({
            response_type: "in_channel",
            text: `"${quote}"\n - *${author}*`
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch quote :( Stay motivated gng :)"
        });
    }
});

app.command("/slackify-meme", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://meme-api.com/gimme");
        const {title, url, subreddit} = response.data;

        await respond({
            response_type: "in_channel",
            text: `*${title}* (from r/${subreddit})\n${url}`
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch a meme :( your life is a live meme :)"
        });
    }
});

app.command("/slackify-advice", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://api.adviceslip.com/advice")
        const { advice } = response.data.slip;
        await respond ({
            response_type: "in_channel",
            text: advice
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch advice :( stay strong :)"
        });
    }
});

app.command("/slackify-dogfact", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://dogapi.dog/api/v2/facts");
        const dogFact = response.data.data[0].attributes.body;

        await respond({
            response_type: "in_channel",
            text: dogFact
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch dog fact :( meow meow"
        });
    }
});

app.command("/slackify-dogpic", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://dog.ceo/api/breeds/image/random");
        const url = response.data.message;

        await respond({
            response_type: "in_channel",
            text: `Here's dog image: ${url}`
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch a dog image :( this too shall pass"
        });
    }
});

app.command("/slackify-foxpic", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://randomfox.ca/floof/");
        const imgUrl = response.data.image;

        await respond({
            response_type: "in_channel",
            text: `A fox image (clever like you): ${imgUrl}`
        });
    } catch (error) {
        await respond({
            text: "Cant fetch fox image - see a live example in mirror :)"
        });
    }
});

app.command("/slackify-bored", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://bored-api.appbrewery.com/random");
        const data = response.data.activity;

        await respond({
            response_type: "in_channel",
            text: `Bored? Try this: ${data}`
        });
    } catch (error) {
        await respond({
            text: "your boredom bored me also - failed to fetch any activity suggestion :("
        });
    }
});

app.command("/slackify-numtrivia", async ({ack, respond}) => {
    await ack();

    try {
        const response = await axios.post(
            `${AI_BASE_URL}/chat/completions`,
            {
                model: "qwen/qwen3-32b",
                messages: [
                    {
                        role: "user",
                        content: "Give me a single random, weird, or interesting trivia fact about any random number. Keep it brief, just text, no markdown formatting."
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

        const trivia = response.data.choices[0].message.content;

        await respond({
            response_type: "in_channel",
            text: `Number TriviaL ${trivia}`
        });
    } catch (error) {
        await respond({
            text: "failed to fetch number trivia :( even math is scared of you - aura ++"
        });
    }
});

app.command("/slackify-affirm", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://www.affirmations.dev/");
        const data = response.data.affirmation;

        await respond({
            response_type: "in_channel",
            text: `Affirmation: ${data}`
        });
    } catch (error) {
        await respond({
            text: "Can't fetch an affirmation - universe is out of compliments today :("
        });
    }
});

app.command("/slackify-toss", async ({ack, respond}) => {
    await ack();

    try {
        const response = await axios.get("https://yesno.wtf/api");
        const {answer, image} = response.data;

        await respond({
            response_type: "in_channel",
            text: `Answer: ${answer.toUpperCase()}\n${image}`
        });
    } catch (error) {
        await respond({
            text: "Toss failed :( go get a coin and toss"
        });
    }
});

app.command("/slackify-weather", async ({ack, command, respond}) => {
    await ack();

    const city = command.text ? command.text.trim() : "";

    if (!city) {
        await respond({
            text: "Please provide a city name like `/slackify-weather Lahore`"
        });
        return;
    }

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoResp = await axios.get(geoUrl);

        if (!geoResp.data.results || geoResp.data.results.length === 0) {
            await respond({
                text: `Could not find weather results for ${city}. Please recheck city name`
            });
            return;
        }

        const {latitude, longitude, name, country} = geoResp.data.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`;

        const weatherResp = await axios.get(weatherUrl);

        const {temperature_2m, wind_speed_10m, weather_code} = weatherResp.data.current;

        let condition = "Clear";

        if (weather_code === 0) {
            condition = "Clear Sky!";
        }
        else if ([1, 2, 3].includes(weather_code)) {
            condition = "Partly Cloudy!";
        }
        else if([45, 48].includes(weather_code)) {
            condition = "Foggy!";
        }
        else if ([51, 53, 55,61,63,65].includes(weather_code)) {
            condition = "Rainy!";
        }
        else if ([71, 73, 75, 77, 85, 86].includes(weather_code)) {
            condition = "Snowy!";
        }
        else if ([95, 96, 99].includes(weather_code)) {
            condition = "Thunderstorm!";
        }

        await respond({
            response_type: "in_channel",
            text: `Current Weather for ${name}, ${country}:\n Conditions: ${condition}\n Temperature: ${temperature_2m}°C\n Wind Speed: ${wind_speed_10m} km/h`
        });
    } catch (error) {
        await respond({
            text: "Failed to load weather conditons - no joke this time :("      
        });
    }
});

app.command("/slackify-github", async ({ack, command, respond}) => {
    await ack();

    const username = command.text ? command.text.trim() : "";

    if(!username) {
        await respond({
            text: "Please provide a GitHub username. For example: `/slackify-github orpheus`"
        });

        return;
    }

    try {
        const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
            headers: {
                "User-Agent": "Slackify-Bot"
            }
        });

        const { login, name, public_repos, followers, html_url } = response.data;
        const displayName = name ? `${name} (@${login})` : `@${login}`;

        await respond({
            response_type: "in_channel",
            text: `Github Profile for ${displayName}:\n Public Repositories: ${public_repos}\n Followers: ${followers}\n Profile Link: ${html_url}`
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await respond({
                text: `Could not find Github Profile with username: ${username}`
            });
        }
        else {
            await respond({
                text: "Failed to fetch Github Profile Data. Octocat is taking a nap, come back later :)"
            });
        }
    }
});

app.command("/slackify-excuse", async ({ack, command, respond}) => {
    await ack();

    const category = command.text ? command.text.trim() : "";
    const validCategories = ["office", "family", "children", "college", "party", "funny"];

    let url = "https://excuser-three.vercel.app/v1/excuse/";

    if (category && validCategories.includes(category)) {
        url = `https://excuser-three.vercel.app/v1/excuse/${category}`;
    }

    try {
        const response = await axios.get(url);
        const excuse = response.data[0];

        await respond({
            response_type: "in_channel",
            text: `Excuse (${excuse.category}):\n ${excuse.excuse}`
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch an excuse - guess you'll have to tell truth this time :)"
        });
    }

});

app.command("/slackify-define", async ({ack, command, respond}) => {
    await ack();

    const word = command.text ? command.text.trim() : "";

    if(!word) {
        await respond({
            text: "Please provide a word to define. Example: /slackify-define dynamic"
        });
        return;
    }

    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

        const firstEntry = response.data[0];
        const partOfSpeech = firstEntry.meanings[0].partOfSpeech;
        const definition = firstEntry.meanings[0].definitions[0].definition;

        await respond({
            response_type: "in_channel",
            text: `Definition for ${firstEntry.word}:\n_${partOfSpeech}_\n -> ${definition}`
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await respond({
                text: "Can't find definition for this word. Please check you spellings."
            });
        }
        else {
            await respond({
                text: "Failed to fetch the definition - go ask your english teacher :)"
            });
        }
    }
});

app.command("/slackify-color", async ({ack, respond}) => {
    await ack();

    try {
        const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const url = `https://singlecolorimage.com/get/${randomHex}/200x200`;

        await respond({
            response_type: "in_channel",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Random Color Variant: \`#${randomHex.toUpperCase()}\``
                    }
                },
                {
                    type: 'image',
                    image_url: url,
                    alt_text: `Color Swatch for #${randomHex}`
                }
            ]
        });
    } catch (error) {
        await respond({
            text: "Failed to generate random hex string. Use #ffffff and #000000 right now :)"
        });
    }
});

app.command("/slackify-ask", async ({ack, command, respond}) => {
    await ack();

    const question = command.text ? command.text.trim() : "";

    if(!question) {
        await respond({
            text: "Please provide a question. Example: `/slackify-ask How many r's are there in strawberry?`"
        });
        return;
    }

    try {
        const response = await axios.post(
            `${AI_BASE_URL}/chat/completions`,
            {
                model: "qwen/qwen3-32b",
                messages: [
                    {
                        role: "user",
                        content: `Answer the following question: ${question}. Be as short, direct and concise as possible. Return response without special formatting like *, / etc.`
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

        const aiResponse = response.data.choices[0].message.content;

        await respond({
            response_type: "in_channel",
            text: `*AI Assistant:* ${aiResponse}`
        });
    } catch (error) {
        await respond({
            text: `Error fetching response from HCAI :(: ${error} | use your own brain bro :)`
        });
    }
});

app.command("/slackify-roast", async ({ack, command, respond}) => {
    await ack();

    let topic = command.text ? command.text.trim() : "";

    if(!topic) {
        topic = "anything"
    }

    try {
        const response = await axios.post(
            `${AI_BASE_URL}/chat/completions`,
            {
                model: "qwen/qwen3-32b",
                messages: [
                    {
                        role: "user",
                        content: `Roast ${topic} in most brutal and savage way possible - be short and direct but savage`
                    }
                ],
                stream: false,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                    "Content-Type": "application/json"
                },
            },
        )

        const aiResp = response.data.choices[0].message.content;

        await respond({
            response_type: "in_channel",
            text: `RoastAI: ${aiResp}`
        })
    } catch (error) {
        await respond({
            text: `Error fetching response from HCAI: ${error} | watch insta reels comments to get idea of how to roast`
        });
    }
});

app.command("/slackify-summarize", async ({ack, command, respond}) => {
    await ack();

    const text = command.text ? command.text.trim() : "";

    if(!text) {
        await respond({
            text: "Please enter the text to summarize. Example: /slackify-summarize [text to summarize]"
        });
        return ;
    }

    try {
        const response = await axios.post(
            `${AI_BASE_URL}/chat/completions`,
            {
                model: "qwen/qwen3-32b",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text: '${text}'. Return summary of no more than 100 words - try to be as short and concise as possible.`
                    }
                ],
                stream: false,
            },
            {
                headers:{
                    "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const aiRes = response.data.choices[0].message.content;

        await respond({
            response_type: "in_channel",
            text: `AI Summary:\n${aiRes}`
        });
    } catch (error) {
        await respond({
            text: `Failed fetching response from HCAI: ${error} | read whole article/chat bruh :)`
        });
    }
});

app.command("/slackify-8ball", async ({ack, command, respond}) => {
    await ack();
    const question = command.text ? command.text.trim() : "";

    if (!question){
        await respond({
            text: "Ask Magic 8-ball a question. Example: `/slackify-8ball Will I win HCB July Raffle?`"
        });
        
        return;
    }

    const responses = [
        "It is certain 🟢",
        "It is decidedly so 🟢",
        "No doubt 🟢",
        "Definitely 🟢",
        "As I see it, yes 🟢",
        "Try again :( 🟡",
        "Ask Again Later 🟡",
        "Would be better if you asked later 🟡",
        "Cannot Predict now 🟡",
        "Concentrate and ask again 🟡",
        "NOOOOOOO 🔴",
        "Doesn't sounds good 🔴",
        "Very doubtful 🔴",
        "Heavy Risk 🔴",
        "Dispossible 🔴😂"
    ];

    const randomAns = responses[Math.floor(Math.random() * responses.length)];

    await respond({
        response_type: "in_channel",
        text: `Magic 8-Ball\n-> Question: ${question}\n-> Answer: ${randomAns}`
    });
});

app.command("/slackify-hug", async ({ack, command, respond}) => {
    await ack();
    const target = command.text ? command.text.trim() : "someone";

    const gif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndjN4d2pqOHVwOHd4MnR4d2pxOHVwOHd4MnR4d2pxOHVwOHd4MnR4d2px/od5H3PmEG5EVq/giphy.gif";

    await respond({
        response_type: "in_channel",
        text: `${command.user_name} gives a big hug to ${target}!\n${gif}`
    });
});

app.command("/slackify-highfive", async ({ack, command, respond}) => {
    await ack();
    const target = command.text ? command.text.trim() : "the channel";

    const gif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndjN4d2pqOHVwOHd4MnR4d2pxOHVwOHd4MnR4d2pxOHVwOHd4MnR4d2px/3oEJHV0z8S7WM4MwnK/giphy.gif";

    await respond({
        response_type: "in_channel",
        text: `${command.user_name} high-fives ${target}!\n${gif}`
    });
});

app.command("/slackify-trivia", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://opentdb.com/api.php?amount=1");

        if(!response.data.results || response.data.results.length === 0) {
            await respond({
                text: "API returned nothing - what a bad luck :("
            });
            return;
        }

        const item = response.data.results[0];

        const cleanQs = item.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&eacute;/g, 'é');
    
        const choices = [...item.incorrect_answers, item.correct_answer].map(c => c.replace(/&quot;/g, '"').replace(/&#039;/g, "'")).sort(()=> Math.random() - 0.5);
        
        await respond({
            response_type: "in_channel",
            text: `Trivia (${item.category}) - (${item.difficulty})\n\nQuestion -> ${cleanQs}\n\nOptions:\n${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n_(Reveal Answer: ||${item.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'")}||)_`
        });
    } catch (error) {
        await respond({
            text: "Failed to fetch trivia question - all i can say is 'YOU ARE LIKE EINSTEIN BECAUSE HE WAS ALSO HUMAN :)'"
        });
    }
});

(async () => {
    await app.start();
    console.log("bot is not walking, it is running :)");
})();