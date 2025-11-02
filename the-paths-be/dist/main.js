import OpenAI from "openai";
import express from "express";
import cors from "cors";
import 'dotenv/config';
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());
app.post("/submit", async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) {
            return res.status(400).json({ error: "Input is required" });
        }
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: `Based on this scenario: "${input}", provide exactly 3 possible outcomes.
                    Format your response EXACTLY like this with no additional text:

                    **Positive**
                    - First bullet point
                    - Second bullet point
                    **Action**
                    - What the user should do based on this outcome

                    **Neutral**
                    - First bullet point
                    - Second bullet point
                    **Action**
                    - What the user should do based on this outcome

                    **Negative**
                    - First bullet point
                    - Second bullet point
                    **Action**
                    - What the user should do based on this outcome

                    Do not add any introductory text or conclusions. Start directly with **Positive**.`
                }
            ]
        });
        res.json({ scenarios: response.choices[0].message.content });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate scenarios" });
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
