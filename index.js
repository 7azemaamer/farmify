import app from "./farmify-main/src/app.js"; // Ensure `app.js` exists in the root directory
import dotenv from 'dotenv';
import authRoutes from './farmify-main/src/modules/auth/auth.routes.js';

dotenv.config();

app.use('/auth',authRoutes);
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on port',PORT);
});
