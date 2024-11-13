import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const questionsRouter = Router();

///////////////////// QUESTIONS
questionsRouter.post("/", async (req, res) => {
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
questionsRouter.get("/search", async (req, res) => {
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

questionsRouter.get("/:questionId", async (req, res) => {
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

questionsRouter.get("/", async (req, res) => {
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

questionsRouter.put("/:questionId", async (req, res) => {
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

questionsRouter.delete("/:questionId", async (req, res) => {
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

export default questionsRouter;
