import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀 XD");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

/////////////////////

app.post("/questions", async (req, res) => {
  const newQuestion = req.body;
  if (!newQuestion.title || !newQuestion.description || !newQuestion.category) {
    return res.status(400).json({
      message:
        "Server could not create question because there are missing data from client",
    });
  }
  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );
    return res.status(201).json({
      message: `Question id: .... has been created successfully`,
    });
  } catch {
    return res.status(500).json({
      message: `Server could not create question because database connection`,
    });
  }
});

app.get("/questions/:id", async (req, res) => {
  const questionId = req.params.id;
  try {
    let result = await connectionPool.query(
      `SELECT * FROM questions WHERE id=$1`,
      [questionId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested question",
      });
    }
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Server could not read question because database connection",
    });
  }
});

app.get("/questions", async (req, res) => {
  const category = req.query.category;
  const keywords = req.query.keywords;
  try {
    let query = "SELECT * FROM questions";
    let values = [];
    if (keywords && category) {
      query += " WHERE category ilike $1 and title ilike $2";
      values = [`%${category}%`, `%${keywords}%`];
    } else if (keywords) {
      query += " WHERE title ilike $1";
      values = [`%${keywords}%`];
    } else if (category) {
      query += " WHERE category ilike $1";
      values = [`%${category}%`];
    }
    const result = await connectionPool.query(query, values);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read question because database connection",
    });
  }
});
