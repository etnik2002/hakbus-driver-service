const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT | 4467;
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
require("dotenv").config();

const driverRoutes = require("./routes/driver")

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
  
  app.get('/', (req, res) => {
    try {
      res.status(200).json({message: "HakBus API - driver"})
    } catch (error) {
      res.status(500).json({message: "Error"})
    }
  })

  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(cors());
  
  app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));

  app.use('/driver', driverRoutes);
  
  app.use(
    session({
      secret: process.env.OUR_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
      }),
    })
  );
  
  mongoose.connect(process.env.DATABASE_URL)
    .then(() => { console.log("Connected to database!") })
    .catch((err) => { console.log("Connection failed!", err) });


app.listen(PORT, ()=> {console.log(`server listeting on http://localhost:${PORT}`)})