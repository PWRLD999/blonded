export default async function handler(req, res) {

    // Allow your GitHub Pages website to access this API
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://pwrld999.github.io"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Handle browser preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        return res.status(500).json({
            error: "Missing Spotify environment variables"
        });
    }

    try {

        // Get a fresh Spotify access token
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    "Authorization":
                        "Basic " +
                        Buffer.from(
                            `${clientId}:${clientSecret}`
                        ).toString("base64")
                },

                body: new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken
                })
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(400).json(tokenData);
        }

        // Get currently playing track
        const spotifyResponse = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenData.access_token}`
                }
            }
        );

        // Nothing playing
        if (spotifyResponse.status === 204) {
            return res.status(200).json({
                is_playing: false
            });
        }

        if (!spotifyResponse.ok) {
            const error = await spotifyResponse.text();

            return res
                .status(spotifyResponse.status)
                .send(error);
        }

        const data = await spotifyResponse.json();

        if (!data.item) {
            return res.status(200).json({
                is_playing: false
            });
        }

        return res.status(200).json({

            is_playing: data.is_playing,

            progress_ms: data.progress_ms,

            duration_ms: data.item.duration_ms,

            song: data.item.name,

            artist: data.item.artists
                .map(artist => artist.name)
                .join(", "),

            album: data.item.album.name,

            album_art:
                data.item.album.images?.[0]?.url || null,

            spotify_url:
                data.item.external_urls?.spotify || null
        });

    } catch (err) {

        return res.status(500).json({
            error: err.message
        });
    }
}
