const express = require("express");
const path = require("path");

const app = express();

const PORT = 8080;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/info", (req, res) => {
    res.json({
        application: "DevOps Shack",
        environment: "production",
        server: "private-backend",
        status: "healthy"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`DevOps Shack running on port ${PORT}`);
});
