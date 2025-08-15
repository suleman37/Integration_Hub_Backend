import app from "./app";
import connectDB from "./config/db";
import './job/worker';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



