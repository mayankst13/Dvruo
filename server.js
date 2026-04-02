const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ===== STATIC FILES =====
app.use(express.static("public"));

// ===== TESTS FOLDER =====
const BASE_DIR = path.join(__dirname, "tests");

// Serve test HTML files
app.use("/tests", express.static(BASE_DIR));

// ===== HELPER FUNCTION =====
function getFolderStructure(basePath) {
    const academies = fs.readdirSync(basePath);

    return academies
        .filter(academy => !academy.startsWith(".")) // ignore hidden files
        .map(academy => {
            const academyPath = path.join(basePath, academy);

            const branches = fs.readdirSync(academyPath)
                .filter(branch => !branch.startsWith("."))
                .map(branch => {
                    const branchPath = path.join(academyPath, branch);

                    const tests = fs.readdirSync(branchPath)
                        .filter(file => file.endsWith(".html")); // only HTML files

                    return {
                        branch,
                        tests
                    };
                });

            return {
                academy,
                branches
            };
        });
}

// ===== API ROUTE =====
app.get("/api/tests", (req, res) => {
    try {
        const data = getFolderStructure(BASE_DIR);
        res.json(data);
    } catch (error) {
        console.error("Error reading folders:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
});
// 404 HANDLER
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));

});