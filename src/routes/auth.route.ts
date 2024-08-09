import {Router} from 'express'
import {signupHandler, verifyEmailHandler} from "../controllers/auth.controller";
import signupValidator from "../validators/signupValidator";

const authRoutes = Router();

authRoutes.post('/sign-up', signupValidator, signupHandler);
authRoutes.get('/verify-email', verifyEmailHandler);

export default authRoutes;