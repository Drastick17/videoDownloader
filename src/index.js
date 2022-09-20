require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { RESOLVE } = require("./utils.js")

const PORT = process.env.PORT || 3002;
const app = express();
app.use(cors());

app.use(express.static(RESOLVE(""))); // FUNCIONO XD
app.use(express.json());


app.get("/", (req, res) => {
   res.sendFile(RESOLVE("index.html"));
});

app.use(require('../src/routes/v1/videoRoutes.js'))

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));