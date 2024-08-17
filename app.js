import dotenv from "dotenv";
dotenv.config();

import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("This is THE Phalanx Demo Server");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
