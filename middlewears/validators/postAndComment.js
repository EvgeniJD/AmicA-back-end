import { body } from 'express-validator';

export default [
    body('content', 'Content should not be empty').isLength({min: 1})
]