import 'dotenv/config';

import connectDB from './db/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`App start on url :: http://localhost:${PORT}`);
});
