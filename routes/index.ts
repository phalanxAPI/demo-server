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
    firstName: "Admin",
    lastName: "User",
    email: "admin@phalanx.xyz",
  },
  user1: {
    firstName: "User",
    lastName: "One",
    email: "user1@phalanx.xyz",
  },
  user2: {
    firstName: "User",
    lastName: "Two",
    email: "user2@phalanx.xyz",
  },
};

const validatePhalanxRequest = (req: Request, res: Response) => {
  // *Validate Common Security Token
  const commonSecurityToken = req.headers["phalanx-shared-secret"];
  console.log("commonSecurityToken", commonSecurityToken);
  console.log(
    "process.env.PHALANX_SHARED_SECRET",
    process.env.PHALANX_SHARED_SECRET
  );
  if (commonSecurityToken !== process.env.PHALANX_SHARED_SECRET) {
    return res.status(401).send("Unauthorized Access");
  }
};

router
  .get("/phalanx/tokens", validatePhalanxRequest, (req, res) => {
    res.send(tokens);
  })
  .post("/phalanx/user-data", validatePhalanxRequest, (req, res) => {
    res.send(userData);
  })

  .put("/test", demoController)
  .delete("/test", demoController)
  .get("/test/example", demoController)
  .post("/test/example", demoController)
  .get("/example", demoController)
  .post("/example", demoController);

export default router;
