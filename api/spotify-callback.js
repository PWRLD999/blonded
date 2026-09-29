export default async function handler(req, res) {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Spotify authorization failed: ${error}`);
    }

    if (!code) {
        return res.status(400).send("Missing authorization code.");
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return res.status(500).send("Missing Spotify environment variables.");
    }

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization":
                        "Basic " +
                        Buffer.from(
                            `${clientId}:${clientSecret}`
                        ).toString("base64")
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: redirectUri
                })
            }
        );

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(400).json(data);
        }

        return res.status(200).send(`
            <h1>Spotify Connected</h1>
            <p>Your authorization worked.</p>
            <p><strong>Copy this refresh token into Vercel:</strong></p>
            <textarea style="width:100%;height:100px;">${data.refresh_token}</textarea>
            <p>Vercel variable name:</p>
            <code>SPOTIFY_REFRESH_TOKEN</code>
        `);

    } catch (err) {
        return res.status(500).send("Server error: " + err.message);
    }
}
