const express = require('express');
const app = express();
const port = 4000;
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
var bodyParser = require('body-parser')
const dbHandler = require('./services/dbHandler'); // Import des neuen Moduls
require('dotenv').config();
const apiUrl = process.env.XTREAMAPIURL;
const username = process.env.XTREAMUSER;
const password = process.env.XTREAMPASSWORD;
const cron_update = process.env.CRON_UPDATE;
const session = require('express-session');
const { randomBytes } = require("node:crypto");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use("/icons", express.static(path.join(__dirname, "node_modules/bootstrap-icons/font")));
app.use("/hls", express.static(path.join(__dirname, "node_modules/hls.js/dist")));
app.use(express.urlencoded({ extended: true })); // Middleware für Form-Daten
app.use(bodyParser.json());
app.use(cors());

const sessionSecret = randomBytes(32).toString("hex");
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 7*24*60*60*1000 }
}));

// Cron-Job für Updates
cron.schedule(cron_update, () => {
    dbHandler.updateTables();
});

// Route zum manuellen Update
app.get('/update', (req, res) => {
    dbHandler.updateTables();
    res.send("Database-Update is running...");
});

// Startseite mit Account- und Stream-Informationen
app.get('/', async (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;
    if (isLoggedIn) {
        try {
            const account = await dbHandler.getAccount();
            expdate = new Date(account.user_info.exp_date * 1000);
            account.user_info.expires = expdate.toLocaleDateString("de-DE", { month: "2-digit", day: "2-digit", year: "numeric" });
            
            const streams = await dbHandler.getCategoriesWithStreams();
            res.render('index', { streams, apiUrl, username, password, account });
        } catch (error) {
            console.error("Error retrieving data:", error);
            res.status(500).send("Error retrieving data.");
        }
    }else{
        res.render('login');
    }
});

app.post('/login', async (req, res) => {
    if(req.body.password == password && req.body.username == username){
      req.session.isLoggedIn = true;
      res.redirect("/"); 
    }else {
      var login_error = true;
      res.render('login', {login_error});
    }
      
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// Server starten
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
