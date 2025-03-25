const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GROUP_ID = 5308358; // 🔹 Your Roblox Group ID
const ROBLOX_COOKIE = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_B47D2AE5BBB21D174A5B1C23B81FB4974ACA75F2790FE882542DE522E90A3DCB22DA639132CE849213BDE0D8E91242EF71AA584BF7189A83A2C040C66D489A4B4C48E000865523E76B2E0E3450078728B0F661EA3DD2378DFF23E6A9B85DEF8AE7FCA2095B3D02FB3A8811A30E091F245C139E5E4C5C8822BE6F9A2FE4EDF176A5FD95AEDD4B3EEDC94722217A32C50561C5C8D2067B010ED12F0D9FB5EF811E3BDCFDA23AAE920B3243CB03C0B60CA2838BE705459415B19ADBD341E2B1315C6DC061DBB513478F51B510CE369B09D67CFA1C238ACF854A002689DE2D7E1D30D951E1D78146A7D60020F1C910A841DB75C53272DA3423964D4AC0A745CAA3F7E39DD0B143CDA7EE1AE7C1D2EEBB4E4ECE32ACB9CDE5DE78A155E912203981D0323DAE59BA1C6BF1D979B79EFA9CBE79D5547F73E2DF8040E4175B6F11F4F6EBAD46C9DAB0BAC8884FEE3ED40AB4BB41CCA388EE5FE97639990D7977DBEDC56951F5007551A29BBC5B3EDC6F34487D1460FC69B2D4A1B68A0D22C973F18E30E089378A4A6ED7251D0FD204892F9B7AB3C16595D843F6DBB2CE64DC64AA0DBECF4377C3214136FC9C1ABEAFF93F22CB49DA17296907DAA48D6D49C2AEDADE02365011F1A985D64D4D8F761D73FD36DF4B634907FCE187DF47FE1CC455E34318757A12F73D4C8963A3AD4BC80ACC0613BABEF55ECC342A37D8E2CE9C63FBBB8BA38A43C69E42ADCE8FB72358602CAE47272528B89C1B40593E6290FD236E3DFA586ED89EC72F501E4DEE0A247FD60C24DE4A5A7D324A9E10A993003467B6D48DDD0052310031E45A8AC5A86FB0C786D45DF217D396BBB51E9600945B8471457332946BD61B5FD60D7884175E9C23705849C73A5674D94BE549A44D49ECBAA9552EE36C41146DD77890F4E98136DDE7486BA844A19E2C973A94C4816E4F4959629E833AC9DC6CFFD270B3D73DF682DFDD426A60740756774DAD3F2230FD506E8B68769936F43BFAA1E85AEAB722E305FCFAACC494FE30DF5774EC74C4A4F845729517A6098844EA1F03937D854DF629012F724F68C45F368343A8DB282FF9041AE9CD94A9C54A0F701A9BDFCC2595807937EC7209211B65138664167F4604D3A72D4CC323EC5F2A9BC76EDA16265EB718ADDB0B3413"; // 🔥 Use an alt account!

console.log("starting this")
const ROLES = {
    "Guest": 0,        // 🔹 Example Role IDs (Replace with real ones)
    "Member": 1,
    "Developer": 15,
    "Admin": 254,
};

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
async function setPlayerRank(userId, newRankId) {
    try {
        // Step 1: Get CSRF token
        const tokenResponse = await axios.post(
            "https://auth.roblox.com/v2/logout",
            {},
            {
                headers: { Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}` },
                validateStatus: function (status) {
                    return status === 403; // Expecting 403 response with token
                }
            }
        );
        
        const csrfToken = tokenResponse.headers["x-csrf-token"];
        if (!csrfToken) {
            console.error("Failed to retrieve CSRF token");
            return false;
        }

        // Step 2: Send the actual request with the retrieved CSRF token
        await axios.patch(
            `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`,
            { role: newRankId },
            {
                headers: {
                    "x-csrf-token": csrfToken, // Use the retrieved CSRF token
                    Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`
                },
            }
        );

        console.log(`Successfully set rank for user ${userId} to ${newRankId}`);
        return true;
    } catch (err) {
        console.error("Error setting rank:", err.response?.data || err.message);
        return false;
    }
}

// 📌 Promote Player
app.post("/promote", async (req, res) => {
    const { userId } = req.body;
    console.log(userId)
    if (!userId) return res.status(400).json({ error: "User ID required" });

   /* let currentRankId = await getPlayerRank(userId);
    if (!currentRankId) return res.status(400).json({ error: "Player not found in group" });

    let roleNames = Object.keys(ROLES);
    let currentIndex = roleNames.findIndex(name => ROLES[name] === currentRankId);

    if (currentIndex === -1 || currentIndex >= roleNames.length - 1)
        return res.status(400).json({ error: "Cannot promote further" });

    let newRoleName = roleNames[currentIndex + 1];
    let newRankId = ROLES[newRoleName];*/

    if (await setPlayerRank(userId, 15)) {
        return res.json({ success: true, newRole: newRoleName });
    } else {
        return res.status(500).json({ error: "Failed to promote" });
    }
});

// 📌 Demote Player
app.post("/demote", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    let currentRankId = await getPlayerRank(userId);
    if (!currentRankId) return res.status(400).json({ error: "Player not found in group" });

    let roleNames = Object.keys(ROLES);
    let currentIndex = roleNames.findIndex(name => ROLES[name] === currentRankId);

    if (currentIndex <= 0)
        return res.status(400).json({ error: "Cannot demote further" });

    let newRoleName = roleNames[currentIndex - 1];
    let newRankId = ROLES[newRoleName];

    if (await setPlayerRank(userId, newRankId)) {
        return res.json({ success: true, newRole: newRoleName });
    } else {
        return res.status(500).json({ error: "Failed to demote" });
    }
});

// 📌 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
