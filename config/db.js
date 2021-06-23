import mongoose from 'mongoose';
import config from './config.js'

mongoose.set('useCreateIndex', true);

export default () => mongoose.connect(config.dbURL, {useNewUrlParser: true, useUnifiedTopology: true});