import express from 'express';
import { chunks, normalize } from './textutil.js';
import { answer, embed } from './ollama.js';
import { insertDoc, search } from './db.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.post('/train', async (req, res, next) => {
    try {
        const { source, text } = req.body;

        const normalized = normalize(text);
        const chunkData = chunks(normalized);

        for (let c of chunkData) {
            const embedData = await embed(c);
            console.log('embedData', embedData);
            await insertDoc(source, c, embedData);
        }

        return res.status(200).json({ status: true, chunks_added: chunks.length });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, json: "Something went wrong" })
    }
});

app.post("/search", async (req, res) => {
    const { question } = req.body;

    const embedding = await embed(question);
    const rows = await search(embedding, 5);

    const filtered = rows
        .filter(r => r.similarity > 0.50)
        .map(r => r.content)
        .filter(Boolean);

    if (filtered.length === 0) {
        return res.json({
            status: true,
            answer: "I don’t have enough information to answer that right now. You can help me by feeding more details"
        });
    }

    const context = filtered.join("\n---\n");

    const result = await answer(context, question);

    return res.json({
        status: true,
        answer: result.trim()
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server successfully running on PORT ${process.env.PORT}`);
})
