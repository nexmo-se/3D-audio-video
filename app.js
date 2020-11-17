const express = require("express")
const app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// use the express-static middleware
app.use(express.static("./"))

// define the first route
app.post("/inbound", function (req, res) {
})

app.post("/status", function (req, res) {
        res.status(200).end();
        console.log(req.body);
})
// start the server listening for requests
app.listen(process.env.PORT || 3000,
        () => console.log("Server is running..."));
