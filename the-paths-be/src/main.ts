import OpenAI from "openai";
import express from "express"
import cors from "cors"
import 'dotenv/config'

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const app = express()
const PORT = 4000
app.use(cors())
app.use(express.json())

app.post("/submit", async(req, res) => {
    try {
        const { input } = req.body
        
        if (!input) {
            return res.status(400).json({ error: "Input is required" })
        }

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: `Based on this input: "${input}", provide 3 possible scenarios that could happen. One positive, one neutral, and one negative.`
                }
            ]
        })

        res.json({ scenarios: response.choices[0].message.content })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to generate scenarios" })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})