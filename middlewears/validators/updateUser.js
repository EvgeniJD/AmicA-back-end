import { body } from 'express-validator';

export default [
    body("username", "Username should be between 1 and 20 characters long (only english letter and digits are allowed)").custom(IsAlphaNumCustom).isLength({ min: 1, max: 20 }),
    body("email", "Invalid email adress").isEmail(),
    body("avatar", "Avatar should be valid URL").isURL()
]


function IsAlphaNumCustom(username) {
    const regExp = new RegExp('[a-zA-Z0-9]+ ?[a-zA-Z0-9]*');
    return regExp.test(username);
}
