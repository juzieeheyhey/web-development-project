// Look at the other router files and figure out how to implement the auth router
// Until you do, you will not be able to login or register or even make requests to those routes

import express from 'express';
import { signup, login } from './auth.controller';


const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);

export default router;

