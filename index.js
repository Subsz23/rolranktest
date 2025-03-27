const express = require("express");
const axios = require("axios");
const roblox = require("noblox.js")

const app = express();
app.use(express.json());

const GROUP_ID = 5308358; // 🔹 Your Roblox Group ID
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE; // Stored securely in Replit Secrets

console.log("starting this")
const ROLES = {
    "Guest": 0,        // 🔹 Example Role IDs (Replace with real ones)
    "Member": 1,
    "Developer": 15,
    "Admin": 254,
};

roblox.setCookie(ROBLOX_COOKIE).then(() => console.log('Logged into Roblox.')).catch(console.error);

// 📌 Get Player's Current Rank
async function getPlayerRank(userId) {
    try {
        const response = await axios.get(
            `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
            { headers: { Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}` } }
        );

        const group = response.data.data.find(g => g.group.id === GROUP_ID);
        return group ? group.role.id : null;
    } catch (err) {
        console.error("Error fetching rank:", err.message);
        return null;
    }
}

// 📌 Change Player Rank
async function getCSRFToken() {
    try {
        const response = await axios.post(
            "https://auth.roblox.com/v2/login",
            {},
            {
                headers: {
                    Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`
                }
            }
        );
    } catch (error) {
        if (error.response && error.response.headers["x-csrf-token"]) {
            const csrfToken = error.response.headers["x-csrf-token"];
            console.log("✅ CSRF Token Retrieved:", csrfToken);  // Log CSRF token
            return csrfToken;
        } else {
            console.error("❌ Failed to get CSRF token:", error.response?.data || error.message);
        }
    }
    throw new Error("CSRF token retrieval failed");
}

async function setPlayerRank(userId, newRankId) {
    try {
        // Step 1: Retrieve CSRF token
        const csrfToken = await getCSRFToken();

        // Step 2: Attempt rank change
        const response = await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { role: newRankId },
            {
                headers: {
                    "x-csrf-token": csrfToken,
                    "Content-Type": "application/json",
                    Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`
                }
            }
        );

        console.log(`✅ Successfully promoted user ${userId} to rank ${newRankId}`);
        return true;
    } catch (err) {
        console.error("❌ Error setting rank:", err.response?.data || err.message);
        return false;
    }
}
// 📌 Promote Player
app.post("/promote", async (req, res) => {
    const { userId, rankId } = req.body;
    console.log(userId)
    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        await roblox.setRank(Number(GROUP_ID), Number(userId), Number(rankId));
        res.send({ success: true, message: 'Rank updated.' });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// 📌 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));