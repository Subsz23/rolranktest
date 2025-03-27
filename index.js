const express = require("express");
const axios = require("axios");
const roblox = require("noblox.js")

const app = express();
app.use(express.json());

const GROUP_ID = 5308358; // 🔹 Your Roblox Group ID
const ROBLOX_COOKIE = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_D24AE2371ED31CD5828AB20D2BC6467D75CFBD9A408557E27D56E05315E6B77CDC8948236FDAEDBDB6234B292BB6744E1DDAD74D476FFFBA97B46729CC261B7361A13C8D0687EE6148FB32CFFE5FC169E6C7F2EBABFB214C54BC7B6FDB37F1BBC6577263241CAE41FCB705DAFC537BDDB9EC554E4B35C733B96F2A6E7306D0F75F02EC32B2D29859E0A40AE295DE5AA17B522C083DFF08BB3C7F12A74BD001D49D8421DEA91978A8285F5C1A9CC0A271935B0D3D0978927D7F8B953F371C8FA6FFD25089ACA221DEBC4472AA7D7B25CBFC3A77E7D64B1F0A9E8FAB56D4FB34A36CBE3AB9945CBE46ADBCA6CC75E8DE0D1FFAD2CD4D35801DF28281A8B603753EF8C8972A7B02FC8948C55F69A877A80DD3C705E62EE3DC965A27179E3106239863729FAFE1CE9B68DEE6E7A08AEFF2CF5CC4D9ABF345E49D76B208332239EF3C17135E3E96DE8E01190FEEB55D991F7DC8262EB28D9A4A85586504B361DCD4993895C1FD10B5B3703795603D941C4235F9308EE8B31E8D99F4EEFEDCA20FA53BF32E813F2CAEF6DFE6AF8A65F76C598470DB05809AAD294298DAE9CAA20115A346EBEDCE9AC8481A18CFBF9357F1BD6907CC33041FCBAFCBAD6814E0B1AD9EA33D9F2ABD4C55B2BAE8E434FB3AF6A88789BD6D005DDC658B9F3D510E184DAB1DD0405E8C18A527A8424FBF076F31012F4840C28D3CDB8CC3E18D81810F370CD7AC9C28BCEE41FFC91DCC1B92F94B45DD65A39DD745FC021C7322A5AE8307B71F0B65044A45D4CE0B9C0675B5650C90CB6794E6B2C444179ADA3EACF53A6D74D81E9082928DCEEC6EE1772425D4E7EAAAF14E7482D9BD51893069C262A2627631D550F0C8AD51DB27E85AF7E14632C21CE9A134E7BB2D001E947244DB454416E23FECB6F186CBB4BF5E51638CB1B812DCA6128DEC42EB45D16D2588AE18D296BE552AA4B21F4BBAD012595251821DA6BC7D12933E19A344172408F2F0FD2E36AE92FF7BA6AC8AB514F5BC358ECD62D52917914D8ABE9165A09CC25F61C67D5552DF2512DF229177807609A598A65D2157D6F55EB11A5404258354EB286CC9AE2CACEC6886ABB17CA04A101D2289B09173F170DD9E5713522BB00E13B82952E146B8F80F4E0C4DBAB7342C2FD359353B0E5BD8A270"; // 🔥 Use an alt account!

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
