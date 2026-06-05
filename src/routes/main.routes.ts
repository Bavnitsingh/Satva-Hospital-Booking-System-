import { Router } from "express";
import auth from "../modules/auth/auth.routes.js";
const router:Router=Router();

router.use("/auth",auth)




export default router;