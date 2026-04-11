require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to database before starting the server
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Fail fast
    }
}

startServer();
