export default async function handler(req, res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET"
    );

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        return res.status(500).json({
            error: "Spotify environment variables are missing."
        });
    }

    // Get a fresh access token
    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "Authorization":
                    `Basic ${credentials}`
            },

            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        return res.status(tokenResponse.status).json({
            error: "Could not refresh Spotify token.",
            details: tokenData
        });
    }

    const accessToken = tokenData.access_token;

    // Get currently playing song
    const spotifyResponse = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                "Authorization":
                    `Bearer ${accessToken}`
            }
        }
    );

    // Nothing currently playing
    if (spotifyResponse.status === 204) {
        return res.status(200).json({
            playing: false
        });
    }

    if (!spotifyResponse.ok) {
        const errorData = await spotifyResponse.text();

        return res.status(spotifyResponse.status).json({
            error: "Spotify API error",
            details: errorData
        });
    }

    const data = await spotifyResponse.json();

    if (!data.item) {
        return res.status(200).json({
            playing: false
        });
    }

    const track = data.item;

    const artists = track.artists
        .map(artist => artist.name)
        .join(", ");

    const albumArt =
        track.album &&
        track.album.images &&
        track.album.images.length > 0
            ? track.album.images[0].url
            : "";

    res.status(200).json({

        playing: data.is_playing,

        song: track.name,

        artist: artists,

        album: track.album
            ? track.album.name
            : "",

        albumArt: albumArt,

        spotifyUrl:
            track.external_urls
                ? track.external_urls.spotify
                : "",

        progressMs:
            data.progress_ms || 0,

        durationMs:
            track.duration_ms || 0
    });
}
