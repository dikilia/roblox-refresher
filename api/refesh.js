// api/refresh.js
// This works on Render, Vercel, Netlify, and any Node.js environment

async function getGeneralToken(cookie) {
    const response = await fetch('https://www.roblox.com/authentication/signoutfromallsessionsandreauthenticate', {
        method: 'POST',
        headers: {
            'Cookie': `.ROBLOSECURITY=${cookie}`,
            'Content-Type': 'application/json'
        }
    });
    
    const csrfToken = response.headers.get('x-csrf-token');
    if (!csrfToken) throw new Error('Failed to get CSRF token');
    return csrfToken;
}

async function refreshCookie(cookie) {
    if (!cookie) throw new Error('Cookie is required');
    
    try {
        const token = await getGeneralToken(cookie);
        
        const response = await fetch('https://www.roblox.com/authentication/signoutfromallsessionsandreauthenticate', {
            method: 'POST',
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
                'X-CSRF-TOKEN': token,
                'Content-Type': 'application/json'
            }
        });
        
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            const match = setCookieHeader.match(/\.ROBLOSECURITY=([^;]+)/);
            if (match && match[1]) {
                const newCookie = match[1];
                return { success: true, cookie: newCookie, message: 'Cookie refreshed successfully!' };
            }
        }
        
        throw new Error('No cookie returned from refresh');
    } catch (error) {
        throw new Error(`Failed to refresh cookie: ${error.message}`);
    }
}

// For Render Web Service
module.exports = async (req, res) => {
    // Enable CORS
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
    
    const { cookie } = req.body;
    
    if (!cookie) {
        return res.status(400).json({ error: 'Cookie is required' });
    }
    
    try {
        const result = await refreshCookie(cookie);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
