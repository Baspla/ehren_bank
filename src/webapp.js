const redis = require('redis');
const express = require("express");
const webapp = express()
const {jsonrpcHandler,setRedisClient} = require("./jsonrpc.js")

//
// SETUP
//

const rc = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

setRedisClient(rc)

    rc.on('error', err => {
        console.log('Redis Error: ' + err);
    });

    webapp.set('view engine', 'pug')
    webapp.use('/css', express.static(__dirname + '/../node_modules/bootstrap/dist/css'))
    webapp.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js'))
    webapp.use('/scripts', express.static(__dirname + '/../scripts'))
    webapp.use(express.json());

//
// JSON RPC ENDPOINT
//
{
    webapp.post('/jsonrpc', jsonrpcHandler);
}

//
// WEP PAGES
//
{
    webapp.get('/', (req, res) => {
        res.redirect("/login")
    })
    webapp.get('/register', (req, res) => {
        res.render('register')
    })
    webapp.get('/deleteuser', (req, res) => {
        res.render('deleteuser')
    })
    webapp.get('/apps', (req, res) => {
        res.render('apps')
    })
    webapp.get('/login', (req, res) => {
        res.render('login')
    })
    webapp.get('/registerapp', (req, res) => {
        res.render('newapp')
    })
    webapp.get('/deleteapp', (req, res) => {
        res.render('deleteapp')
    })

    async function start() {
        await rc.connect().then(() => {
            console.log(`Verbindung zu Redis auf ${process.env.REDIS_HOST}:${process.env.REDIS_PORT} hergestellt.`)
            webapp.listen(80, () =>
                console.log(`Express wurde gestartet.`)
            );
        })
    }

    start().then(() => {
    });
}
