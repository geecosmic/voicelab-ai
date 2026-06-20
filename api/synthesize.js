export default async function handler(req, res) {
    // Enable cross-origin requests so your frontend can talk to your backend safely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, token } = req.body;

    try {
        // High-speed cloud model query pipeline
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: text })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ error: errData.error || 'Hugging Face API rejected request' });
        }

        // Convert the raw audio block stream into standard vector packets
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/flac');
        return res.send(Buffer.from(buffer));

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
