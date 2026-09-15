const express = require('express');
const router = express.Router();

async function getIAMToken(apiKey) {
    const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: new URLSearchParams({
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            apikey: apiKey
        })
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch IAM token from IBM Cloud');
    }
    const data = await res.json();
    return data.access_token;
}

async function callWatsonx(prompt, apiKey, projectId) {
    const token = await getIAMToken(apiKey);
    
    const url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";

    const payload = {
        input: prompt,
        parameters: {
            decoding_method: "greedy",
            max_new_tokens: 300,
            repetition_penalty: 1
        },
        model_id: "meta-llama/llama-3-70b-instruct",
        project_id: projectId
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error(`Watsonx API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results[0].generated_text;
}

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const apiKey = process.env.WATSONX_API_KEY;
        const projectId = process.env.WATSONX_PROJECT_ID;

        // Fetch local context
        let context = "Grid Status: Normal.";
        try {
            const riskRes = await fetch('http://localhost:5000/api/risk-assessments');
            const riskData = await riskRes.json();
            if (riskData.success && riskData.data.length > 0) {
                context = `Highest Risk Asset: ${riskData.data[0].asset_name} (Risk Score: ${riskData.data[0].outage_risk_score}).`;
            }
        } catch (e) {
            console.error("Could not fetch local risk context");
        }

        const systemPrompt = `You are IBM Bob, a professional AI advisor for GridGuard AI, managing power grid infrastructure.
Answer the user's question concisely using this live grid context:
[CONTEXT START]
${context}
[CONTEXT END]
User Question: ${message}
Bob:`;

        if (!apiKey || !projectId || apiKey === 'YOUR_WATSONX_API_KEY') {
            // Mock response if keys are missing
            console.log("Mocking Watsonx response (Missing API Keys)");
            return res.json({ 
                success: true, 
                reply: `[MOCK WATSONX RESPONSE] I am IBM Bob. I see you asked: "${message}". Please add your WATSONX_API_KEY to the .env file to enable real LLM responses! Based on the context, ${context}` 
            });
        }

        const reply = await callWatsonx(systemPrompt, apiKey, projectId);
        
        res.json({
            success: true,
            reply: reply.trim()
        });
    } catch (err) {
        console.error('Chat AI Error:', err);
        res.status(500).json({ success: false, error: err.message || 'AI processing failed' });
    }
});

module.exports = router;
