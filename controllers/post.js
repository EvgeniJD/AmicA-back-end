import PostModel from '../models/post.js';
import UserModel from '../models/user.js';
import CommentModel from '../models/comment.js';
import properName from '../utils/properName.js';
import formValidatorResult from '../middlewears/validators/formValidatorResult.js';

function getAllPosts(req, res) {
  PostModel.find({})
    .populate('owner', ['avatar', 'username'])
    .sort({ date: -1 })
    .then((result) => {
      return res.send(result);
    })
    .catch(console.log);
}

function getPost(req, res) {
  PostModel.findOne({ _id: req.params.postId })
    .populate('owner', ['avatar', 'username'])
    .then((result) => {
      if (!result) {
        return res.status(404).send({ errorMessage: 'Post not found!' });
      }
      return res.send(result);
    })
    .catch(console.log);
}

function createPost(req, res) {
  const regValidations = formValidatorResult(req);

  if (!regValidations.isOk) {
    return res.status(400).send(regValidations.contextOptions.messages);
  }

  const date = Date.now();
  const post = { ...req.body, date }

  PostModel.create(post)
    .then(post => {
      const userPromise = UserModel.findOneAndUpdate(
        { _id: post.owner },
        {
          $addToSet: {
            posts: post._id,
            latestActivity: {
              objectId: post._id,
              message: 'Created post',
              date
            }
          }
        }, { useFindAndModify: false });

      const postPromise = PostModel.findOne({ _id: post._id })
        .populate('owner', ['username', 'avatar']);

      Promise.all([postPromise, userPromise])
        .then(([post]) => res.send(post))
        .catch(console.log);
    })
    .catch(console.log);
}

function updatePost(req, res) {
  const date = Date.now();
  const updateKey = Object.keys(req.body)[0];

  if (updateKey === 'likes' || updateKey === 'dislikes') {

    PostModel
      .findOneAndUpdate(
        { _id: req.params.postId },
        {
          $addToSet: {
            [updateKey]: req.body[updateKey]
          }
        },
        {
          new: true,
          useFindAndModify: false
        })
      .populate('owner', 'username')
      .then((post) => {

        const username = properName(post.owner, req.user, 'your own');
        const message = `${updateKey === 'likes' ? 'Liked' : 'Disliked'} ${username} post`;

        const userPromise = UserModel
          .findOneAndUpdate(
            { _id: req.user._id },
            {
              $push: {
                latestActivity: {
                  objectId: post._id,
                  message,
                  date
                }
              }
            }, { useFindAndModify: false });

        Promise.all([post, userPromise])
          .then(([post]) => res.send({ [updateKey]: post[updateKey] }))
          .catch(console.log);
      })
      .catch(console.log);

  } else if (updateKey === 'content') {

    const regValidations = formValidatorResult(req);

    if (!regValidations.isOk) {
      return res.status(400).send(regValidations.contextOptions.messages);
    }

    PostModel
      .findOneAndUpdate(
        { _id: req.params.postId },
        req.body,
        {
          new: true,
          useFindAndModify: false
        })
      .then((post) => {

        const userPromise = UserModel.findOneAndUpdate(
          { _id: post.owner },
          {
            $addToSet: {
              latestActivity: {
                objectId: post._id,
                message: 'Edited your post',
                date
              }
            }
          }, { useFindAndModify: false });

        Promise.all([post, userPromise])
          .then(([post]) => {
            return res.send({ [updateKey]: post[updateKey] });
          })
          .catch(console.log)

      })
      .catch(console.log)
  }
}

function deletePost(req, res) {
  const date = Date.now();

  PostModel.findOneAndDelete({ _id: req.params.postId })
    .then(post => {

      const userPromise = UserModel
        .findOneAndUpdate(
          { _id: post.owner },
          {
            $pull: { posts: post._id },
            $addToSet: {
              latestActivity: {
                objectId: post._id,
                message: 'Deleted your post',
                date
              }
            }
          }, { useFindAndModify: false });

      const commentPromise = CommentModel.deleteMany({ parentPost: post._id });

      Promise.all([post, userPromise, commentPromise])
        .then(([post]) => res.send({ deletedPostId: post._id }))
        .catch(console.log);
    })
}


export default {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost
}