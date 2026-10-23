import { Router, type IRouter } from "express";
import healthRouter from "./health";
import checkoutRouter from "./checkout";
import { productsRouter } from "./products";
import { adminRouter } from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(checkoutRouter);
router.use(productsRouter);
router.use(adminRouter);

export default router;
