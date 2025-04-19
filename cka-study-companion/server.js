const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const app = express();
const port = 3010;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Data storage directory
const DATA_DIR = process.env.DATA_DIR || '/data/cka-app';
const DATA_FILE = path.join(DATA_DIR, 'user-data.json');
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'chat-history.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating data directory:', err);
    }
}
ensureDataDir();

// OpenAI configuration (requires API key from environment variable)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'placeholder-key' // Replace with actual key in production
});

// System prompt for AI chat
const SYSTEM_PROMPT = {
    role: 'system',
    content: 'You are a helpful assistant for Kubernetes and CKA (Certified Kubernetes Administrator) exam preparation. Provide concise, accurate answers focusing on practical solutions and concepts related to Kubernetes.'
};

// Load user data from file
async function loadUserData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.log('No user data file found, initializing with default values.');
        return {
            progress: Array(30).fill(false),
            points: 0,
            notes: Array(30).fill('')
        };
    }
}

// Save user data to file
async function saveUserData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving user data:', err);
        return false;
    }
}

// Load chat history from file
async function loadChatHistory() {
    try {
        const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf8');
        const parsed = JSON.parse(data);
        // Ensure system prompt is always at the start
        if (parsed.length === 0 || parsed[0].role !== 'system') {
            parsed.unshift(SYSTEM_PROMPT);
        }
        return parsed;
    } catch (err) {
        console.log('No chat history file found, initializing with system prompt.');
        return [SYSTEM_PROMPT];
    }
}

// Save chat history to file
async function saveChatHistory(history) {
    try {
        // Ensure system prompt is always at the start
        if (history.length === 0 || history[0].role !== 'system') {
            history.unshift(SYSTEM_PROMPT);
        }
        await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving chat history:', err);
        return false;
    }
}

// API endpoint to load user data
app.get('/api/load', async (req, res) => {
    try {
        const data = await loadUserData();
        res.json(data);
    } catch (err) {
        console.error('Error loading data:', err);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// API endpoint to save user data
app.post('/api/save', async (req, res) => {
    try {
        const data = req.body;
        const success = await saveUserData(data);
        if (success) {
            res.json({ message: 'Data saved successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// API endpoint for chatbot interaction
app.post('/api/chatbot', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Missing or empty query in request' });
        }

        // Load chat history
        let conversationHistory = await loadChatHistory();
        
        // Append user message
        conversationHistory.push({ role: 'user', content: query });

        // Prune history to keep only the last 3 user messages + responses (and system prompt)
        const MAX_HISTORY = 3;
        const userIndices = conversationHistory.filter(msg => msg.role === 'user').map((_, i) => i + 1); // +1 for system prompt
        if (userIndices.length > MAX_HISTORY) {
            const keepFromIndex = userIndices[userIndices.length - MAX_HISTORY - 1];
            conversationHistory = [SYSTEM_PROMPT, ...conversationHistory.slice(keepFromIndex)];
        }

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use appropriate model
            messages: conversationHistory,
            max_tokens: 120,
            temperature: 0.7
        });

        const assistantMessage = response.choices[0].message.content.trim();
        conversationHistory.push({ role: 'assistant', content: assistantMessage });

        // Save updated history
        await saveChatHistory(conversationHistory);

        res.json({ result: assistantMessage });
    } catch (err) {
        console.error('Error in chatbot endpoint:', err);
        res.status(500).json({ error: 'Failed to get response from assistant', details: err.message });
    }
});

// API endpoint to reset conversation history
app.post('/api/reset_conversation', async (req, res) => {
    try {
        await saveChatHistory([SYSTEM_PROMPT]);
        res.json({ result: 'Conversation history reset successfully' });
    } catch (err) {
        console.error('Error resetting conversation:', err);
        res.status(500).json({ error: 'Failed to reset conversation history' });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`CKA Study Companion App running on http://0.0.0.0:${port}`);
});