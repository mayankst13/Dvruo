const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const BASE_DIR = path.join(__dirname, "tests");

app.use(express.static("public"));
app.use("/tests", express.static(BASE_DIR));

// API
app.get("/api/tests", (req, res) => {
  let result = [];

  fs.readdirSync(BASE_DIR).forEach(academy => {
    let branches = [];

    fs.readdirSync(path.join(BASE_DIR, academy)).forEach(branch => {
      let tests = fs
        .readdirSync(path.join(BASE_DIR, academy, branch))
        .filter(f => f.endsWith(".html"));

      branches.push({ branch, tests });
    });

    result.push({ academy, branches });
  });

  res.json(result);
});

app.listen(PORT, () => console.log("🔥 http://localhost:3000"));