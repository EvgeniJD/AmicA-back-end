import { body } from 'express-validator';

export default [
    body("username", "Username must be between 1 and 20 characters long (only english letter and digits are allowed)").custom(IsAlphaNumCustom).isLength({ min: 1, max: 20 }),
    body("email", "Invalid email adress").isEmail(),
    body("password", "Password must be at least 6 characters long (only english letter and digits are allowed)").isLength({ min: 6 }),
    body("confirmPassword").custom(confirmPasswordCheck)
]


function IsAlphaNumCustom(username) {
    const regExp = new RegExp('[a-zA-Z0-9]+ ?[a-zA-Z0-9]*');
    return regExp.test(username);
}

function confirmPasswordCheck(confirmPassword, { req }) {
    if (confirmPassword !== req.body.password) {
        throw new Error(
            "Password confirmation does not match password."
        );
    }

    return true;
}