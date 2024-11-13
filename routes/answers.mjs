import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const answersRouter = Router({ mergeParams: true });

//////// ANSWERS

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create an answer for a question
 *     description: Create an answer for a specific question by providing the content of the answer.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question to which the answer belongs.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the answer.
 *                 maxLength: 300
 *     responses:
 *       201:
 *         description: Answer created successfully
 *       400:
 *         description: Invalid request data or answer exceeds character limit
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to create answer
 */
answersRouter.post("/", async (req, res) => {
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
    if (newAnswer.content.length > 300) {
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

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get all answers for a question
 *     description: Retrieve all answers for a specific question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question whose answers are being fetched.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of answers for the given question
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to fetch answers
 */
answersRouter.get("/", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    let result = await connectionPool.query(
      `
        SELECT * FROM answers where question_id=$1
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

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   delete:
 *     summary: Delete all answers for a question
 *     description: Delete all answers associated with a specific question by its ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question whose answers are being deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All answers for the question have been deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to delete answers
 */
answersRouter.delete("/", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    let result = await connectionPool.query(
      `
        DELETE FROM answers where question_id=$1
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

export default answersRouter;
