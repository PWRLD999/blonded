export default function handler(req, res) {
    res.status(200).json({
        status: "working",
        message: "Vercel function is running"
    });
}
