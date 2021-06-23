import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const { secret, authCookieName } = config;

const signJWT = promisify(jwt.sign);

export default function signToken(req, res) {
    return new Promise((resolve, reject) => {

        const loginUser = req.user;

        Promise.all([loginUser, signJWT(loginUser, secret)])
            .then(([loginUser, jwtToken]) => {
                res.cookie(authCookieName, jwtToken, { httpOnly: true });
                res.send(loginUser);
            })
            .catch(e => reject(`Error from signToken: ${e.message}`));

    })

}
