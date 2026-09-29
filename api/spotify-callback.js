export default async function handler(req, res) {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("No authorization code received.");
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    if (!data.refresh_token) {
        return res.status(500).send(
            "No refresh token received. Try authorizing again."
        );
    }

    res.setHeader("Content-Type", "text/html");

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Spotify Authorization</title>
            <style>
                body {
                    background: #111;
                    color: white;
                    font-family: Arial, sans-serif;
                    padding: 40px;
                }

                code {
                    display: block;
                    padding: 20px;
                    background: #222;
                    word-break: break-all;
                    margin-top: 20px;
                }
            </style>
        </head>

        <body>

            <h1>Spotify connected.</h1>

            <p>
                Copy the refresh token below and add it to Vercel
                as <b>SPOTIFY_REFRESH_TOKEN</b>.
            </p>

            <code>${data.refresh_token}</code>

            <p>
                Do not share this token with anyone.
            </p>

        </body>
        </html>
    `);
}
