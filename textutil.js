export const normalize = (text) => {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export const chunks = (text, size = 1800, overlap = 250) => {
    let start = 0;
    const chunks = [];

    while (start < size) {
        const end = start + size;
        let data = text.slice(start, end);
        if (data != "" && data != null && data != undefined) {
            chunks.push(text.slice(start, end));
        }
        start = end - overlap;
    }

    return chunks;
}