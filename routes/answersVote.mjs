import { Router } from "express";
import connectionPool from "./../utils/db.mjs";

const answersVoteRouter = Router({ mergeParams: true });

/////// ANSWER VOTE
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
