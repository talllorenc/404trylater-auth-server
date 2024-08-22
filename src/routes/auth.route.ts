import {Router} from 'express'
import {signinHandler, signupHandler, verifyEmailHandler} from "../controllers/auth.controller";
import signupValidator from "../validators/signupValidator";
import signinValidator from '../validators/signinValidator';

const authRoutes = Router();

authRoutes.post('/sign-up', signupValidator, signupHandler);
authRoutes.post('/sign-in', signinValidator, signinHandler);
authRoutes.get('/verify-email', verifyEmailHandler);

export default authRoutes;