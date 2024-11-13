import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const questionsRouter = Router();

///////////////////// QUESTIONS

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question with a title, description, and category.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Unable to create question
 */
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

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search for questions
 *     description: Search for questions by title or category.
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: The title of the question.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category of the question.
 *     responses:
 *       200:
 *         description: List of questions matching the search criteria
 *       400:
 *         description: Invalid search parameters
 *       500:
 *         description: Unable to fetch questions
 */
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

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a specific question
 *     description: Retrieve a question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The question details
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to fetch question
 */
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

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a specific question
 *     description: Retrieve a question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The question details
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to fetch question
 */
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

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieve a list of all questions.
 *     responses:
 *       200:
 *         description: A list of all questions
 *       500:
 *         description: Unable to fetch questions
 */
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

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update a question
 *     description: Update the details of a question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to update question
 */
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

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     description: Delete a question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to delete question
 */
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
