import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/config.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  avatar: {
    type: String,
    default: "https://s.clipartkey.com/mpngs/s/112-1124283_profile-profile-clipart.png"
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  latestActivity: [
    {
      objectId: {type: mongoose.Schema.Types.ObjectId},
      message: String,
      date: Date
    }
  ],
})

userSchema.methods.comparePasswords = function (providedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(providedPassword, this.password, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};


userSchema.pre("save", function (done) {
  if (!this.isModified("password")) {
    done();
    return;
  }

  bcrypt.genSalt(config.saltRounds, (err, salt) => {
    if (err) {
      done(err);
      return;
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        done(err);
        return;
      }

      this.password = hash;
      done();
    });
  });
});

const User = mongoose.model('User', userSchema);
export default User;