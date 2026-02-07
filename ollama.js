const ollama = process.env.OLLAMA_URL;

export const embed = async (text) => {
    try {
        const res = await fetch(`${ollama}/api/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "nomic-embed-text",
                prompt: text,
            })
        });

        const json = await res.json();
        return json.embedding;

    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
    }
}

export const answer = async (context, question) => {
    try {
        const prompt = `
            CONTEXT:
            ${context}

            QUESTION:
            ${question}

            TASK:
            Answer the question using ONLY the CONTEXT.
            If the answer does not exist in CONTEXT, reply exactly like this, don't add anything:
            I’m unable to answer that at the moment. Please ask only about Inter Smart Solution Private Limited.

            ANSWER:
        `;

        const res = await fetch(`${ollama}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "phi3:mini",
                prompt: prompt,
                repeat_penalty: 1.2,
                temperature: 0,
                stream: false,
                stop: ["\n", "Explanation", "Sure", "Here's"],
            })
        });
        const json = await res.json();
        return json.response;

    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
    }
}