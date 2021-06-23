import express from 'express';
import expressConfig from './config/express.js';
import config from './config/config.js';
import routes from './config/routes.js';
import dbConnector from './config/db.js'

dbConnector()
.then(() => {
    console.log('Database is ready for work !');

    const port = config.port;
    const app = express();

    expressConfig(app);
    routes(app);

    app.listen(port, () => console.log(`Server is listening on port ${port}`));
})

