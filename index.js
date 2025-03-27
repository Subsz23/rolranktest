const express = require("express");
const roblox = require("noblox.js");

const app = express();
app.use(express.json());

const GROUP_ID = 5308358; // Your Roblox Group ID
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE; // Ensure this is set in your environment

// Log into Roblox with the provided cookie
roblox.setCookie(ROBLOX_COOKIE)
    .then(() => console.log('✅ Logged into Roblox.'))
    .catch(console.error);

// 📌 Promote a Player
app.post("/promote", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
        await roblox.promote(GROUP_ID, Number(userId));
        res.send({ success: true, message: `User ${userId} has been promoted.` });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// 📌 Demote a Player
app.post("/demote", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
        await roblox.demote(GROUP_ID, Number(userId));
        res.send({ success: true, message: `User ${userId} has been demoted.` });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// 📌 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
