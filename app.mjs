import express from "express";
import questionsRouter from "./routes/questions.mjs";
import answersRouter from "./routes/answers.mjs";
import questionsVoteRouter from "./routes/questionsVote.mjs";
import answersVoteRouter from "./routes/answersVote.mjs";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = 4000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Quora API",
      description: "Questions and Answers Data",
      contact: {
        name: "Earth",
      },
      server: ["http://localhost:4000"],
    },
  },
  apis: [
    "./routes/answers.mjs",
    "./routes/answersVote.mjs",
    "./routes/questions.mjs",
    "./routes/questionsVote.mjs",
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
