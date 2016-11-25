var Express = require('express');
var app = Express();

// test response from GET, on http://localhost:9000/direct/test
app.get('/direct/test', function(req, res, next){
    // has to redirect this to the client first page (use .static instead)
    res.send('Hello From Server');
});

var server = require('http').createServer(app);
// set server to serve static files here
app.use(Express.static(__dirname + '/public'));

// process.env.PORT for Heroku
server.listen(process.env.PORT || 9000);

// games
