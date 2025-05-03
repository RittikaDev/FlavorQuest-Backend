import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://127.0.0.1:3000",
      "http://127.0.0.1:3000",
      "https://flavor-quest-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "FlavortQuest is running",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "The requested path was not found.",
    },
  });
});

export default app;
