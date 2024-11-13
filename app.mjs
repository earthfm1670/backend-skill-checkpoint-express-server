import express from "express";
import questionsRouter from "./routes/questions.mjs";
import answersRouter from "./routes/answers.mjs";
import questionsVoteRouter from "./routes/questionsVote.mjs";
import answersVoteRouter from "./routes/answersVote.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions", questionsRouter);
app.use("/questions/:questionId/answers", answersRouter);
app.use("/questions/:questionId/vote", questionsVoteRouter);
app.use("/answers/:answerId/vote", answersVoteRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀 XD");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
