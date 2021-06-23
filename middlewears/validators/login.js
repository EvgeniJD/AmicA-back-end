import { body } from 'express-validator';

export default [
    body("email", "Invalid email adress").isEmail(),
    body("password", "Password must be at least 6 characters long (only english letter and digits are allowed)").isLength({ min: 6 }),
]