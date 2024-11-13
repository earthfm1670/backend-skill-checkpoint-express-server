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

///////////////////// QUESTIONS

app.post("/questions", async (req, res) => {
  const newQuestion = req.body;
  if (!newQuestion.title || !newQuestion.description || !newQuestion.category) {
    return res.status(400).json({
      message: "Invalid request data",
    });
  }
  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );
    return res.status(201).json({
      message: `Question created successfully`,
    });
  } catch {
    return res.status(500).json({
      message: `Unable to create question`,
    });
  }
});

////////// Search higher prio than :id
app.get("/questions/search", async (req, res) => {
  const category = req.query.category;
  const title = req.query.title;

  if (!title && !category) {
    return res.status(400).json({
      message: "Invalid search parameter",
    });
  }

  try {
    let query = "SELECT * FROM questions";
    let values = [];
    if (title && category) {
      query += " WHERE category ilike $1 and title ilike $2";
      values = [`%${category}%`, `%${title}%`];
    } else if (title) {
      query += " WHERE title ilike $1";
      values = [`%${title}%`];
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
      message: "Unable to fetch a question",
    });
  }
});

app.get("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    let result = await connectionPool.query(
      `SELECT * FROM questions WHERE id=$1`,
      [questionId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Unable to fetch question",
    });
  }
});

app.get("/questions", async (req, res) => {
  try {
    let result = await connectionPool.query(`
      SELECT * FROM questions
      `);
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Unable to fetch questions",
    });
  }
});

app.put("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  const updateQuestion = req.body;
  try {
    let result = await connectionPool.query(
      `
      UPDATE questions
      SET title = $2,
      category = $3,
      description = $4
      WHERE id = $1
      `,
      [
        questionId,
        updateQuestion.title,
        updateQuestion.category,
        updateQuestion.description,
      ]
    );
    if (
      !updateQuestion.title ||
      !updateQuestion.category ||
      !updateQuestion.description
    ) {
      return res.status(400).json({
        message: "Invalid request data",
      });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }
    return res.status(200).json({
      message: "Question updated successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch question",
    });
  }
});

app.delete("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    let result = await connectionPool.query(
      `
      DELETE FROM questions where id = $1
      `,
      [questionId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }
    return res.status(200).json({
      message: "Question post has been deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Unable to delete question",
    });
  }
});

//////// ANSWERS
app.post("/questions/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;
  const newAnswer = req.body;

  if (!questionId) {
    return res.status(404).json({
      message: "Question not found",
    });
  }
  try {
    await connectionPool.query(
      `
      INSERT INTO answers (question_id, content)
      VALUES ($1, $2)
      `,
      [questionId, newAnswer.content]
    );
    if (!newAnswer.content) {
      return res.status(400).json({
        message: "Invalid request data",
      });
    }
    if (!newAnswer.content.length > 300) {
      return res.status(400).json({
        message: "Answer must be 300 characters or less",
      });
    }
    return res.status(201).json({
      message: "Answer created successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to create answers.",
    });
  }
});

app.get("/questions/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    let result = await connectionPool.query(
      `
      SELECT * FROM answers where id=$1
      `,
      [questionId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Unable to fetch answers",
    });
  }
});

app.delete("/questions/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    let result = await connectionPool.query(
      `
      DELETE FROM answers where id=$1
      `,
      [questionId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }
    return res.status(200).json({
      message: "All answers for the question have been deleted successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to delete answers",
    });
  }
});

//////// VOTE
app.post("/questions/:questionId/vote", async (req, res) => {
  const questionId = req.params.questionId;
  const newVote = req.body;

  if (!questionId) {
    return res.status(404).json({
      message: "Question not found",
    });
  }
  try {
    await connectionPool.query(
      `
      INSERT INTO question_votes ($1, $2)
      `,
      [questionId, newVote.vote]
    );
    if (!newVote.vote) {
      return res.status(400).json({
        message: "Invalid vote value",
      });
    }
    return res.status(200).json({
      message: "Vote on the question has been recorded successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to vote question.",
    });
  }
});

app.post("/answers/:answerId/vote", async (req, res) => {
  const answerId = req.params.answerId;
  const newVote = req.body;

  if (!answerId) {
    return res.status(404).json({
      message: "Answer not found",
    });
  }
  try {
    await connectionPool.query(
      `
      INSERT INTO answer_votes ($1, $2)
      `,
      [answerId, newVote.vote]
    );
    if (!newVote.vote) {
      return res.status(400).json({
        message: "Invalid vote value",
      });
    }
    return res.status(200).json({
      message: "Vote on the answer has been recorded successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to vote answer",
    });
  }
});
