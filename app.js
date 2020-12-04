const express = require("express")
const app = express()
var bodyParser = require('body-parser')
var OpenTok = require('opentok');

var apikey="";
var secret="";
var opentok = OpenTok(apikey,secret)

var sessions = {};

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// use the express-static middleware
app.use(express.static("./"))

// define the first route
app.get("/token", function (req, res) {
    var uid = req.query.u;
    if(sessions.hasOwnProperty(uid)){
        console.log("session exists for "+uid);
        let session = sessions[uid];
       /* session already exists, generate a token */
       var token = opentok.generateToken(session);
       res.json({"apiKey":apikey,"sessionId":session,"token":token});
    }
    else{
        console.log("creating new session for "+uid);
       /* session doesn't exists, generate a new session and token */
        opentok.createSession({mediaMode:"routed"},function(error,session){
            if(error){
                res.json({});
            }
            else{
                sessions[uid] = session.sessionId;
                var token = opentok.generateToken(session.sessionId);
                res.json({"apiKey":apikey,"sessionId":session.sessionId,"token":token});
            }
        });
    }
})

app.post("/status", function (req, res) {
        res.status(200).end();
        console.log(req.body);
})
// start the server listening for requests
app.listen(process.env.PORT || 3000,
        () => console.log("Server is running..."));
