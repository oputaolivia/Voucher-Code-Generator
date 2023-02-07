const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const nodemailer = require("nodemailer");
const uri = "mongodb://localhost:27017";
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const client = new MongoClient(uri, { useNewUrlParser: true });
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.post("/submit-details", function (req, res) {
  client.connect((err) => {
    const db = client.db("AzureVouchers");
    const collection = db.collection("users");

    collection.findOne({ name: "" }, function (err, result) {
      if (err) throw err;
      if (result) {
        collection.findOneAndUpdate(
          { name: "" },
          {
            $set: {
              name: req.body.name,
              department: req.body.department,
              gender: req.body.gender,
              email: req.body.email,
            },
          },
          { upsert: false },
          function (err, res) {
            if (err) throw err;
            console.log("Data updated successfully!");
          }
        );

        // send email to user containing their voucher code
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "oputa.olivia@studentambassadors.com",
            pass: "yourpassword",
          },
        });

        let mailOptions = {
          from: 'oputa.olivia@studentambassadors.com',
          to: req.body.email,
          subject: 'Your Voucher Code',
          text: `
            Hello ${req.body.name},
            Your Azure Voucher Code is
           ${result.voucherCode}`
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        // client.close();
        res.send("Details submitted successfully!");
      } else {
        console.log("No empty object found.");
        // client.close();
        res.send("No empty object found.");
      }
    });
  });
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
