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
/slackify-dogfact - Fetches a random dog fact
/slackify-joke - Fetches a random joke
/slackify-tip - Fetches a random tip from HCAI
/slackify-quote - Fetches a random Quote
/slackify-meme - Fetches a random meme (less funny than your life)
/slackify-advice - Fetches a random piece of Advice
/slackify-dogpic - Fetches a random dog picture
/slackify-foxpic - fetches a random fox pic
/slackify-bored - Fetches a random activity suggestion when you are bored
/slackify-numtrivia - Fetches a Number Trivia
/slackify-affirm - fetches a random affirmation
/slackify-toss - fetches either yes or no + an image
/slackify-weather - Fetches live weather of specific city. Usage: /slackify-weather Cityname
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

app.command("/slackify-quote", async ({ack, respond}) => {
    await ack();
    try {
        const response = await axios.get("https://dummyjson.com/quotes/random");
        const {quote, author} = response.data;

        await respond({
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
            text: `Current Weather for ${name}, ${country}:\n Conditions: ${condition}\n Temperature: ${temperature_2m}°C\n Wind Speed: ${wind_speed_10m} km/h`
        });
    } catch (error) {
        respond({
            text: "Failed to load weather conditons - no joke this time :("      
        });
    }
});

(async () => {
    await app.start();
    console.log("bot is not walking, it is running :)");
})();