import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { depositRouter } from "./routes/deposit";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", depositRouter);

// express.json() throws a plain SyntaxError on malformed JSON bodies; keep
// the API's error responses consistently JSON instead of Express's HTML default.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "INVALID_JSON",
      message: "Request body must be valid JSON.",
    });
  }
  next(err);
});
