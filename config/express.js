import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import auth from '../middlewears/auth.js';

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};


export default (app) => {
    app.use(cookieParser());
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(auth);
    app.use(express.static(path.resolve('../static')));
}