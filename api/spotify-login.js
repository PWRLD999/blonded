module.exports = async (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).json({
            error: "Missing Spotify environment variables"
        });
    }

    const scope = "user-read-currently-playing";

    const spotifyUrl =
        "https://accounts.spotify.com/authorize?" +
        new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: scope
        }).toString();

    return res.redirect(spotifyUrl);
};
