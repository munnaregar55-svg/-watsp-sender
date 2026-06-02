const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");

const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();

app.use(express.static("public"));

const upload = multer({
    dest: "uploads/"
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    }
});

client.on("qr", (qr) => {
    console.log("QR CODE SCAN KARO");
    qrcode.generate(qr, {
        small: true
    });
});

client.on("ready", () => {
    console.log("WhatsApp Ready ✅");
});

client.initialize();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/send", upload.single("file"), async (req, res) => {

    try {

        const workbook = xlsx.readFile(req.file.path);

        const sheetName = workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(sheet);

        for (let row of data) {

            // mobile column check
            if (!row["mobile"]) {
                console.log("Mobile Missing");
                continue;
            }

            // number clean
            let number = "91" + String(row["mobile"]).replace(/\D/g, "");

            // dynamic message
            let message = "";

            for (let key in row) {

                message += `${key} : ${row[key]}\n`;

            }

            console.log("Sending To:", number);

            await client.sendMessage(number + "@c.us", message);

            console.log("Sent ✅");

        }

        fs.unlinkSync(req.file.path);

        res.send("WhatsApp Sent Successfully ✅");

    } catch (error) {

        console.log(error);

        res.send("Error Sending WhatsApp ❌");

    }

});

app.listen(5000, () => {

    console.log("Server Running http://localhost:5000");

});
