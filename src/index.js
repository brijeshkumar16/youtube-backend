import https from 'https';
import 'dotenv/config';
import fs from 'fs';

import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = https.createServer(
    {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
    },
    app
);

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`https://localhost:${PORT}/`);
        });

        server.on('error', (error) => {
            console.error(`Error :: HTTPS Server ::`, error);
        });
    })
    .catch((error) => {
        console.error(`Error :: connectDB ::`, error);
    });
