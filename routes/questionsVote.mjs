import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const questionsVoteRouter = Router({ mergeParams: true });

//////// QUESTION VOTE
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
