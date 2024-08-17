import { Request, Response, Router } from "express";

export const router = Router();

const demoController = (req: Request, res: Response) => {
  res.send(`${req.method} ${req.path} Works!`);
};

router
  .get("/test", demoController)
  .post("/test", demoController)
  .put("/test", demoController)
  .delete("/test", demoController)
  .get("/test/example", demoController)
  .post("/test/example", demoController)
  .get("/example", demoController)
  .post("/example", demoController);

export default router;
