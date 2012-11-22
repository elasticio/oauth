/**
 * Module dependencies.
 */
var express = require('express');
var request = require('request');
var qs = require("querystring");
var url = require('url');

var redirectUrl = "http://localhost:9000/callback";

var app = module.exports = express.createServer();


// Configuration
app.configure(function () {
    'use strict';
    app.use(express.bodyParser());
    app.use(express.cookieParser('RtWWgQ3A'));
    app.use(express.session({secret:'h7FoiiugA5GwDJrNcSStu3fW2eETlvn5tPlsd7AAicw8uxM3gzAFP8tBB1T42q'}));
    app.use(express["static"](__dirname + '/public'));
});


app.get('/', function (req, res) {
    res.render('index.html');
});

app.post('/auth', function (req, res, next) {
    var authUri = req.body.authUri;
    var tokenUri = req.body.tokenUri;
    var clienId = req.body.clienId;
    var clientSecret = req.body.clientSecret;
    var scopes = req.body.scopes;

    var session = req.session;

    session.auth = {
        clienId:clienId,
        clientSecret:clientSecret,
        tokenUri:tokenUri
    };

    var query = {
        "response_type":"code",
        "client_id":clienId,
        "redirect_uri":redirectUrl,
        "access_type":"offline",
        "approval_prompt":"force"
    };

    if(scopes){
        query.scope = scopes;
    }

    var oauthURL = authUri + '?' + qs.stringify(query);

    console.log('redirecting: ' + oauthURL);

    res.redirect(oauthURL);
    res.end();
});

app.get('/callback', function (req, res) {
    'use strict';
    var code = req.query.code;
    var error = req.query.error;
    var session = req.session;

    if (error) {
        console.log(error);

    } else if (code) {
        var tokenUri = session.auth.tokenUri;

        var tokenBody = {
            code:code,
            'client_id':session.auth.clienId,
            'client_secret':session.auth.clientSecret,
            'redirect_uri':redirectUrl,
            'grant_type':'authorization_code'
        };

        console.log(tokenBody);

        request.post({
            uri:tokenUri,
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:qs.stringify(tokenBody)
        }, function (err, response, body) {


            console.log(body);

            res.json(JSON.parse(body));
        });

    }
});

app.listen(9000, function () {
    'use strict';
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
