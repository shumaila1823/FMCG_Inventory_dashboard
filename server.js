const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("."));

const PORT = process.env.PORT || 3000;

app.post("/api/ai", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are an AI assistant for an FMCG Inventory Management System. Help users analyze stock, products, suppliers, categories, sales and inventory reports. Give simple, clear and practical answers."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "Groq API request failed."
            });
        }

        const answer =
            data.choices?.[0]?.message?.content ||
            "No answer received.";

        res.json({
            answer: answer
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error. Please try again."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});