import 'dotenv/config';

import connectDB from './db/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on('error', (error) => {
      console.error(`Error :: express ::`, error);
    });
    app.listen(PORT, () => {
      console.log(`App start on url :: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Error :: connectDB ::`, error);
  });
