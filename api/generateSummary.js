// File: api/generateSummary.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const userQuery = req.body.prompt; // Get the prompt from the frontend
        const apiKey = process.env.GEMINI_API_KEY; // Securely access the API key

        if (!apiKey) {
            throw new Error("API key is not configured.");
        }
        if (!userQuery) {
            return res.status(400).json({ message: 'Prompt is required.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Google API Error:", errorBody);
            throw new Error(`Google API call failed with status: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        // Send the successful response back to the frontend
        res.status(200).json({ summary: summaryText });

    } catch (error) {
        console.error("Serverless function error:", error);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
}