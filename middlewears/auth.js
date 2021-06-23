import config from '../config/config.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import attachUserToReq from '../utils/attachUserToReq.js';
import userModel from '../models/user.js'

const verifyToken = promisify(jwt.verify);
const { authCookieName, secret } = config;

function auth(req, res, next) {
    const token = req.cookies[authCookieName];
    if (req.url === '/user/login' || req.url === '/user/register') {
        return next();
    }
    if (!token) {
        return res.status(401).send({ errorMessage: "UNAUTHORIZED!" });
    }

    verifyToken(token, secret)
        .then((decoded) => {
            userModel.findOne({_id: decoded._id})
                .then((user) => {
                    attachUserToReq(user, req);
                    next();
                })
        })
        .catch(next)
}

export default auth;