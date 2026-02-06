import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const insertDoc = async (source, content, embedding) => {
  try {
    const vector = `[${embedding.join(",")}]`;

    await pool.query(
      `INSERT INTO documents (source, content, embedding)
           VALUES ($1, $2, $3)`,
      [source, content, vector]
    );
  } catch (error) {
    console.log(error);
    throw new Error("DB Operation Failed");
  }
}

export const search = async (embedding, limit = 5) => {
  console.log('Query embedding length:', embedding.length);

  const vector = `[${embedding.join(",")}]`;

  const { rows } = await pool.query(
    `
    SELECT content, similarity
    FROM (
      SELECT
        content,
        1 - (embedding <=> $1::vector) AS similarity
      FROM documents
    ) t
    ORDER BY similarity DESC
    LIMIT $2;
    `,
    [vector, limit]
  );
  console.log('RES', rows);
  return rows;
};

