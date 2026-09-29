export default function handler(req, res) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;

    const redirectUri =
        "https://blonded-one.vercel.app/api/spotify-callback";

    if (!clientId) {
        return res.status(500).json({
            error: "Missing SPOTIFY_CLIENT_ID"
        });
    }

    const spotifyUrl =
        "https://accounts.spotify.com/authorize?" +
        new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: "user-read-currently-playing"
        }).toString();

    res.redirect(spotifyUrl);
}
