import { Router } from "express";
import auth from "../modules/auth/auth.routes.js";
import getHomePage from "../modules/auth/auth.controller.js";
const router:Router=Router();

router.use("/auth",auth)
router.get("/home",getHomePage)



export default router;