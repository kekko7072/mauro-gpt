import express, { Request, Response, NextFunction } from "express";
import { chatWithModel } from "./chat";
import { modelCreate } from "./model_create";
import { configDotenv } from "dotenv";
import cors from "cors";

configDotenv({ path: ".env" });

const app = express();

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // if there's no token

  if (token !== process.env.ACCESS_TOKEN) {
    return res.sendStatus(403); // if the token is wrong
  }

  next(); // proceed if the token is correct
}

app.use(cors()); // Use cors

app.use(express.json()); // Middleware to parse JSON bodies

app.use(express.static("public")); // 'public' is the directory where 'index.html' is located

// Routes requiring authentication
app.use("/api", authenticateToken); // Protect all routes under '/api'

// Define a init
app.post("/api/init", async (req: Request, res: Response) => {
  try {
    // 1. Create the chatbot
    await modelCreate().then(() => {
      // 3. Response
      res.send({
        success: true,
        message: "Successfully initalisated!",
      });
    });
  } catch (e) {
    console.error(e);
    res.send({
      success: false,
      message: e,
    });
  }
});

// Define a route to handle POST requests on '/chat'
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send({ error: "Message is required" });
  }
  console.log("Message: " + message);

  // Call your chatbot service with the message
  const response = await chatWithModel(message);

  console.log("Response: " + response);

  res.send({ response });
});
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
