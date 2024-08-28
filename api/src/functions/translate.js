const { app } = require('@azure/functions');
const OpenAI = require("openai");

app.http('translate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const input = await request.json();

        if(!input.text || !input.lang) {
            return { 
                body: JSON.stringify({ 
                    ok: false, 
                    text: "Send both the text to translate and language to translate to in the request body." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            };
        }

        const openai = new OpenAI({
            apiKey: process.env["OPENAI_API_KEY"]
        });

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: "system",
                        content: "You are a language translation assistant.",
                    },
                    { 
                        role: "user", 
                        content: `Translate the following text to ${input.lang}: ${input.text}\n\nReturn only the translated text in the response with no additional content surrounding it.`
                    }
                ]
            });

            const translatedText = response.choices[0].message.content.trim();

            return { 
                body: JSON.stringify({ 
                    ok: true, 
                    text: translatedText 
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            };
        } catch (err) {
            context.error(err);
            return { 
                body: JSON.stringify({ 
                    ok: false, 
                    text: "Error occured. Check logs for more details." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 500
            };
        }
    }
});
