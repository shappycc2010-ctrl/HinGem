import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMsg }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    res.json({ reply: "Error: " + err.message });
  }
});

app.post("/distress", (req, res) => {
  console.log("🚨 DISTRESS SIGNAL RECEIVED!");
  console.log(req.body);

  // Here you can add:
  // - Email sending
  // - SMS sending
  // - Push notification
  // - Save to database

  res.json({ status: "Distress signal received" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
