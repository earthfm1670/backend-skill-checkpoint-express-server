import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const answersVoteRouter = Router({ mergeParams: true });

/////// ANSWER VOTE

/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     description: Records a vote on a specific answer. The vote can be positive or negative.
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         description: The ID of the answer that is being voted on.
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
 *         description: Vote on the answer has been recorded successfully
 *       400:
 *         description: Invalid vote value (should be 1 or -1)
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Unable to record the vote
 */
answersVoteRouter.post("/", async (req, res) => {
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
        INSERT INTO answer_votes (answer_id, vote)
        VALUES ($1, $2)
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

export default answersVoteRouter;
