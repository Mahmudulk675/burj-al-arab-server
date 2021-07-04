const express = require("express");
const MongoClient = require("mongodb").MongoClient;
// const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
// app.use(express.urlencoded({ extended:false}));
app.use(express.json());
app.use(cors());
const admin = require("firebase-admin");
require("dotenv").config();

const uri = `mongodb+srv://BurjAlArab:5aFrt74QaHKLMaig@cluster0.6br73.mongodb.net/BurjAlArab ?retryWrites=true&w=majority`;
const port = 5000;

var serviceAccount = require("./burj-al-arab-bff3a-firebase-adminsdk-tqloz-b9f0cdd4f9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const pass = "5aFrt74QaHKLMaig";

// app.use(cors())
// app.use(bodyParser.json())
// app.use(express.urlencoded({ extended:false}));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("BurjAlArab").collection("bookings");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    //&& bearer.startWith('Bearer ')
    if (bearer) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          console.log(tokenEmail, req.query.email);
          if (tokenEmail == req.query.email) {
            bookings
              .find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              });
          }
          console.log({ uid });
        })
        .catch((error) => {
          res.status(401).send("Unauthorized");
        });
    } else {
      res.status(401).send("Unauthorized");
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
