import axios from "axios";
import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { uuid } from "uuidv4";

export const router = Router();

const demoController = (req: Request, res: Response) => {
  res.send(`${req.method} ${req.path} Works!`);
};

const tokens = {
  admin: uuid(),
  user1: uuid(),
  user2: uuid(),
};

const userData = {
  admin: {
    id: "admin",
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
  },
  user1: {
    id: "user1",
    firstName: "User",
    lastName: "One",
    isAdmin: false,
  },
  user2: {
    id: "user2",
    firstName: "User",
    lastName: "Two",
    isAdmin: false,
  },
};

const validatePhalanxRequest = (req: Request, res: Response, next: any) => {
  // *Validate Common Security Token
  const commonSecurityToken = req.headers["phalanx-shared-secret"];

  if (commonSecurityToken !== process.env.PHALANX_SHARED_SECRET) {
    return res.status(401).send("Unauthorized Access");
  }

  next();
};

const createRateLimiter = (maxRequests = 100) =>
  rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again after 1 minute",
  });

const cacheControl = (req: Request, res: Response, next: any) => {
  res.set("Cache-Control", "no-store");
  next();
};

const processedOrders: Record<string, boolean> = {};

router
  .get("/phalanx/tokens", validatePhalanxRequest, (req, res) => {
    res.send(tokens);
  })
  .get("/phalanx/user-data", validatePhalanxRequest, (req, res) => {
    res.send(userData);
  })

  // Object Level Authorization
  // Authentication
  // Security Configuration
  .get(
    "/test",
    helmet({
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
    cacheControl,
    (req, res) => {
      const token = req.headers.authorization?.split(" ")[1] as string;
      const userId = req.query.userId as string;

      if (!token) {
        return res.status(401).send("Unauthorized Access");
      }

      const userOfToken = Object.keys(tokens).find(
        (key) => tokens[key as keyof typeof tokens] === token
      );

      if (!userOfToken) {
        return res.status(401).send("Unauthorized Access");
      }

      // check if the token of requesting user is same as the token of the user being requested
      if (tokens[userId as keyof typeof tokens] !== token) {
        return res.status(403).send("Forbidden Access");
      }

      return res.send(userData[userId as keyof typeof userData]);
    }
  )

  // Property Level Authorization
  .put("/test", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1] as string;
    const body = req.body;

    if (!token) {
      return res.status(401).send("Unauthorized Access");
    }

    const userOfToken = Object.keys(tokens).find(
      (key) => tokens[key as keyof typeof tokens] === token
    );

    if (!userOfToken) {
      return res.status(401).send("Unauthorized Access");
    }

    // check if body contains isAdmin property and is not admin
    if (body.isAdmin && !userData[body.id as keyof typeof userData].isAdmin) {
      return res.status(403).send("Forbidden Access");
    }

    // Validate and update data
    Object.assign(userData[body.id as keyof typeof userData], body);
    return res.send(userData[body.id as keyof typeof userData]);
  })

  // Function Level Authorization
  .get("/test/internal-info", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1] as string;

    if (!token) {
      return res.status(401).send("Unauthorized Access");
    }

    const userOfToken = Object.keys(tokens).find(
      (key) => tokens[key as keyof typeof tokens] === token
    );

    if (!userOfToken) {
      return res.status(401).send("Unauthorized Access");
    }

    // check if the user is admin
    if (!userData[userOfToken as keyof typeof userData].isAdmin) {
      return res.status(403).send("Forbidden Access");
    }

    return res.send(userData);
  })

  // Restricted Resource Consumption
  .post("/test/public", createRateLimiter(10), demoController)

  // Restricted Access to Sensitive Business Flow
  .post("/test/purchase", (req, res) => {
    const body = req.body;
    const orderId = body.orderId;

    if (processedOrders[orderId]) {
      return res.status(403).send("Forbidden Access");
    }

    processedOrders[orderId] = true;
    return res.send("Order Processed");
  })

  // server side request forgery
  .get("/test/render-avatar", async (req, res) => {
    const url = req.query.url as string;

    console.log({ url });
    if (!url) {
      return res.status(400).send("Bad Request");
    }

    // The format should be: https://api.dicebear.com/8.x/adventurer/svg?seed={{...}}
    const regex =
      /^https:\/\/api\.dicebear\.com\/8\.x\/adventurer\/svg\?seed=.+$/;
    if (!regex.test(url)) {
      return res.status(400).send("Bad Request");
    }

    // Fetch and store somewhere
    await axios.get(url);

    return res.send("Avatar Rendered");
  })
  .post("/example", demoController);

export default router;
