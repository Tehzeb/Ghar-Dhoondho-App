import { Router, type IRouter } from "express";

import adminRouter from "./admin";
import authRouter from "./auth";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import savedRouter from "./saved";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(propertiesRouter);
router.use(adminRouter);
router.use(savedRouter);

export default router;
