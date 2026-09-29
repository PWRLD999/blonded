export default function handler(req, res) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    const scope = "user-read-currently-playing";

    const spotifyUrl =
        "https://accounts.spotify.com/authorize?" +
        new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: scope
        }).toString();

    res.redirect(spotifyUrl);
}
