const env = process.env.NODE_ENV || 'development';
console.log('Environment: ', env);
const config = {
    development: {
        port: process.env.PORT || 5000,
        dbURL: 'mongodb://localhost:27017/amica',
        saltRounds: 11,
        secret: 'RedHotChiliPeppersAndProdigyRocks',
        authCookieName: 'amicaAuth'
    },
    production: {
        port: process.env.PORT || 5000,
        dbURL: 'mongodb+srv://EvgeniJD:EvgeniJD12345@amica.zvlzn.mongodb.net/Amica?retryWrites=true&w=majority',
        saltRounds: 11,
        secret: 'RedHotChiliPeppersAndProdigyRocks',
        authCookieName: 'amicaAuth'
    }
}

export default config[env];