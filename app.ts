import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import bodyParser from "body-parser";
import express from "express";
import phalanx from "./phalanx";
import router from "./routes";

const app = express();
app.use(bodyParser.json({ limit: "10kb" }));

const port = process.env.PORT || 8000;
const appId = process.env.APP_ID || "phalanx-test";
const serverId = process.env.SERVER_ID || "test-server-1";

// Config Phalanx Formation
const PHALANX_FORMATION_OPTIONS = { appId, serverId, app, axios };
phalanx.formation(PHALANX_FORMATION_OPTIONS);

// Config Routes
app.get("/", (_, res) => {
  res.send("This is THE Phalanx Test Server");
});

// Setup Demo Routes
app.use("/api/v1", router);

// Config Phalanx
const PHALANX_DEPLOY_OPTIONS = {
  app,
  appId,
  serverId,
  baseUrl: "http://localhost:8000",
};
phalanx.deploy(PHALANX_DEPLOY_OPTIONS);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port} on Time: ${new Date()}`);
});
