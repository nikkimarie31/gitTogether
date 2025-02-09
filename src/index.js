"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./type.d.ts"); // Ensure this is at the top of your entry file
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Authorization header missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Store the decoded JWT payload on the `req.user` property
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
};
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({
        message: 'Welcome to your dashboard!',
        user: req.user, // `req.user` should now be recognized
    });
});
app.get('/', (req, res) => {
    res.send('Welcome to the GitTogether API');
});
// Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.default.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const user = result.rows[0];
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ error: 'Invalid password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
