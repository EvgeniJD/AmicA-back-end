import postsController from '../controllers/post.js';
import userController from '../controllers/user.js';
import commentsController from '../controllers/comments.js';

import registerValidator from '../middlewears/validators/register.js';
import loginValidator from '../middlewears/validators/login.js';
import updateUserValidator from '../middlewears/validators/updateUser.js';
import postAndComment from '../middlewears/validators/postAndComment.js';

export default (app) => {
    app.post('/user/register', registerValidator, userController.register);
    app.post('/user/login', loginValidator, userController.login);
    app.get('/user/logout', userController.logout);
    app.get('/user/check-auth', userController.checkAuth);
    app.get('/user/:userId', userController.getUser);
    app.put('/user/:userId', updateUserValidator, userController.updateUser);

    app.post('/posts', postAndComment, postsController.createPost);
    app.get('/posts', postsController.getAllPosts);
    app.get('/posts/:postId', postsController.getPost);
    app.put('/posts/:postId', postAndComment, postsController.updatePost);
    app.delete('/posts/:postId', postsController.deletePost);

    app.post('/comments', postAndComment, commentsController.createComment);
    app.get('/comments/:postId', commentsController.getComments);
    app.put('/comments/:commentId', postAndComment, commentsController.editComment);
    app.delete('/comments/:commentId', commentsController.deleteComment);
}