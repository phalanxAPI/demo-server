import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import express from "express";
import phalanx from "./phalanx/index.js";

const app = express();
const port = process.env.PORT || 3000;

// Config Routes
app.get("/", (_, res) => {
  res.send("This is THE Phalanx Test Server");
});

app.post("/test", (_, res) => {
  res.send("This is a test endpoint");
});

// Config Phalanx
const PHALANX_OPTIONS = {
  appId: "phalanx-test",
  serverId: "phalanx-test-server-1",
  app,
  axios,
};
phalanx.formation(PHALANX_OPTIONS);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port} on Time: ${new Date()}`);
});
