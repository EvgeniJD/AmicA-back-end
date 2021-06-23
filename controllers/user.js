import userModel from '../models/user.js';
import formValidatorResult from '../middlewears/validators/formValidatorResult.js';
import attachUserToReq from '../utils/attachUserToReq.js';
import signToken from '../utils/signToken.js';
import config from '../config/config.js';

function register(req, res) {
    const regValidations = formValidatorResult(req);

    if (!regValidations.isOk) {
        return res.status(400).send(regValidations.contextOptions.messages);
    }

    const { username, email, password } = req.body;

    userModel.findOne({ email })
        .then(result => {
            if (result) {
                return res.status(400).send({ errorMessage: 'The email is already registered!' });
            }

            const user = {
                username,
                email,
                password,
                avatar: undefined,
                posts: [],
                latestActivity: [],
            };

            userModel.create(user)
                .then(user => {
                    attachUserToReq(user, req);
                    signToken(req, res);
                })
                .catch(e => console.log('Error from create user: ', e.message));
        })
}

function login(req, res) {
    const loginValidations = formValidatorResult(req);

    if (!loginValidations.isOk) {
        return res.status(400).send(loginValidations.contextOptions.messages);
    }

    const { email, password } = req.body;

    userModel.findOne({ email })
        .then(user => Promise.all([user, user ? user.comparePasswords(password) : false]))
        .then(([user, isPasswordMatch]) => {
            if (!isPasswordMatch) {
                return res.status(403).send({ errorMessage: "Wrong username or password!" });
            }

            attachUserToReq(user, req);
            signToken(req, res);
        })
        .catch(console.log);
}

function logout(req, res) {
    return res.clearCookie(config.authCookieName).send({});
}

function checkAuth(req, res) {
    if (!req.user) {
        return res.status(401).send({ errorMessage: 'UNAUTHORIZED !!!' });
    }

    return res.send(req.user);
}

function getUser(req, res) {
    userModel.findById(req.params.userId)
        .populate('posts', ['content', 'date'])
        .lean()
        .then((result) => {
            if (!result) {
                return res.send({ errorMessage: "There is no user with the provided id !" })
            }

            delete result.password;
            result.latestActivity.sort((a, b) => b.date - a.date);
            result.posts.sort((a, b) => b.date - a.date);
            return res.send(result);
        })
        .catch((e) => console.log(e.message));
}

function updateUser(req, res) {
    const regValidations = formValidatorResult(req);

    if (!regValidations.isOk) {
        return res.status(400).send(regValidations.contextOptions.messages);
    }
    
    userModel.findOne({ email: req.body.email })
        .then((result) => {
            if ((result && result._id.toString() === req.user._id.toString()) || !result) {
                userModel.findOneAndUpdate(
                    { _id: req.params.userId },
                    req.body,
                    { new: true, useFindAndModify: false })
                    .lean()
                    .then((result) => {
                        delete result.password;
                        return res.send(result);
                    })
                    .catch(e => console.log('Error from updateUser: ', e.message));
            } else {
                return res.status(400).send({ errorMessage: 'The email is already registered!' });
            }
        })
        .catch(e => console.log('Errror from updateUser: ', e.message));
}



export default {
    register,
    login,
    logout,
    checkAuth,
    getUser,
    updateUser,
}