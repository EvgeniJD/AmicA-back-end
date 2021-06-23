import CommentModel from '../models/comment.js';
import UserModel from '../models/user.js';
import PostModel from '../models/post.js';

import formValidatorResult from '../middlewears/validators/formValidatorResult.js';

import properName from '../utils/properName.js';

function createComment(req, res) {
    const date = Date.now();
    const comment = { ...req.body, date };

    CommentModel.create(comment)
        .then((createdComment) => {

            const postPromise = PostModel.findOneAndUpdate(
                { _id: createdComment.parentPost },
                {
                    $addToSet: { comments: createdComment._id }
                },
                {
                    new: true,
                    useFindAndModify: false
                })
                .populate('owner', 'username');

            const commentPromise = CommentModel.findById(createdComment._id)
                .populate('owner', ['username', 'avatar']);

            Promise.all([postPromise, commentPromise])
                .then(([post, comment]) => {

                    const postOwnerUsername = properName(post.owner, req.user, 'your own');

                    const userPromise = UserModel.findOneAndUpdate(
                        { _id: createdComment.owner },
                        {
                            $addToSet: {
                                latestActivity: {
                                    objectId: post._id,
                                    message: `Commented on ${postOwnerUsername} post`,
                                    date
                                }
                            }
                        },
                        {
                            new: true,
                            useFindAndModify: false
                        });

                    Promise.all([comment, userPromise])
                        .then(([comment]) => {
                            return res.send(comment);
                        })
                        .catch(console.log)
                })
                .catch(console.log);
        })
}

function getComments(req, res) {

    CommentModel.find({ parentPost: req.params.postId })
        .sort({ date: -1 })
        .populate('owner', ['username', 'avatar'])
        .then((result) => {
            return res.send(result);
        })
        .catch(console.log)

}

function editComment(req, res) {
    const date = Date.now();
    const updateKey = Object.keys(req.body)[0];

    if (updateKey === 'likes' || updateKey === 'dislikes') {

        CommentModel.findOneAndUpdate(
            { _id: req.params.commentId },
            {
                $addToSet: {
                    [updateKey]: req.body[updateKey]
                }
            },
            { new: true, useFindAndModify: false })
            .populate('owner', 'username')
            .then((comment) => {
                const postPromise = PostModel.findById(comment.parentPost)
                    .populate('owner', 'username');

                Promise.all([postPromise, comment])
                    .then(([post, comment]) => {

                        const postOwnerUsername = properName(post.owner, req.user);
                        const commentOwnerUsername = properName(comment.owner, req.user);

                        const message =
                            `${updateKey === 'likes'
                                ? 'Liked'
                                : 'Disliked'} ${commentOwnerUsername} comment on ${postOwnerUsername} post`;

                        const userPromise = UserModel.findOneAndUpdate(
                            { _id: req.user._id },
                            {
                                $addToSet: {
                                    latestActivity: {
                                        objectId: post._id,
                                        message,
                                        date
                                    },
                                }
                            }, { useFindAndModify: false })

                        Promise.all([comment, userPromise])
                            .then(([comment]) => {
                                res.send({ [updateKey]: comment[updateKey] });
                            })
                            .catch(console.log)
                    })
                    .catch(console.log)
            })
            .catch(console.log);

    } else if (updateKey === 'content') {

        const regValidations = formValidatorResult(req);

        if (!regValidations.isOk) {
            return res.status(400).send(regValidations.contextOptions.messages);
        }

        CommentModel.findOneAndUpdate(
            { _id: req.params.commentId },
            req.body,
            { new: true, useFindAndModify: false })
            .populate('owner', 'username')
            .then((comment) => {

                const postPromise = PostModel.findById(comment.parentPost)
                    .populate('owner', 'username');

                Promise.all([postPromise, comment])
                    .then(([post, comment]) => {

                        const postOwnerUsername = properName(post.owner, req.user, 'your own');
                        const message = `Edited your comment on ${postOwnerUsername} post`;

                        const userPromise = UserModel.findOneAndUpdate(
                            { _id: req.user._id },
                            {
                                $addToSet: {
                                    latestActivity: {
                                        objectId: post._id,
                                        message,
                                        date
                                    },
                                }
                            }, { useFindAndModify: false })

                        Promise.all([comment, userPromise])
                            .then(([comment]) => {
                                res.send({ [updateKey]: comment[updateKey] });
                            })
                            .catch(console.log)
                    })
                    .catch(console.log)
            })
            .catch(console.log)
    }
}

function deleteComment(req, res) {
    const date = Date.now();

    CommentModel.findOneAndDelete({ _id: req.params.commentId })
        .then((comment) => {

            const postPromise = PostModel.findOneAndUpdate(
                { _id: comment.parentPost },
                {
                    $pull:
                    {
                        comments: comment._id
                    }
                },
                { new: true, useFindAndModify: false })
                .populate('owner', 'username');

            Promise.all([postPromise, comment])
                .then(([post, comment]) => {
                    const username = properName(post.owner, req.user, 'your own');

                    const userPromise = UserModel.findOneAndUpdate(
                        { _id: comment.owner },
                        {
                            $addToSet: {
                                latestActivity: {
                                    objectId: post._id,
                                    message: `Deleted your comment on ${username} post`,
                                    date
                                }
                            }
                        },
                        { useFindAndModify: false });

                    Promise.all([comment, userPromise])
                        .then(([comment]) => res.send({ deletedCommentId: comment._id }))
                        .catch(console.log)
                })
                .catch(console.log)
        })
        .catch(console.log);
}

export default {
    createComment,
    getComments,
    editComment,
    deleteComment
}