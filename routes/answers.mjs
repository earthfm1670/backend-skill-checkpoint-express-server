import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const answersRouter = Router({ mergeParams: true });

//////// ANSWERS
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
