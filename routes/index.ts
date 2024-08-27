import { Request, Response, Router } from "express";
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

router
  .get("/phalanx/tokens", validatePhalanxRequest, (req, res) => {
    res.send(tokens);
  })
  .get("/phalanx/user-data", validatePhalanxRequest, (req, res) => {
    res.send(userData);
  })

  // Object Level Authorization
  // Broken Authentication
  .get("/test", (req, res) => {
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
  })

  // Broken Property Level Authorization
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
  .get("/test/example", demoController)
  .post("/test/example", demoController)
  .get("/example", demoController)
  .post("/example", demoController);

export default router;
