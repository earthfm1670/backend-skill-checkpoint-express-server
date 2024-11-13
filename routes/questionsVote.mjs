import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const questionsVoteRouter = Router({ mergeParams: true });

//////// QUESTION VOTE

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     description: Records a vote on a specific question. The vote can be positive (1) or negative (-1).
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         description: The ID of the question being voted on.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *                 description: The vote value. It can be 1 (upvote) or -1 (downvote).
 *                 enum: [1, -1]
 *     responses:
 *       200:
 *         description: Vote on the question has been recorded successfully
 *       400:
 *         description: Invalid vote value (should be 1 or -1)
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to record the vote
 */
questionsVoteRouter.post("/", async (req, res) => {
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
        INSERT INTO question_votes (question_id, vote)
        VALUES ($1, $2)
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

export default questionsVoteRouter;
