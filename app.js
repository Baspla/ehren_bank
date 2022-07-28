const express = require("express")
const redis = require('redis');
bodyParser = require('body-parser');

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', err => {
    console.log('Redis Error: ' + err);
});

//
// CHECKS
//

function checkAdminSecret(req) {
    return (req.headers.authorization === "Secret " + process.env.SECRET)
}

function checkAPIKey(req) {
    if(req.headers.authorization === "undefined") return false;
    if (req.headers.authorization.startsWith("Apikey")) {
        let both = req.headers.authorization.substr(7)
        let indexDelim = both.indexOf(":")
        let appId = both.substr(0, indexDelim)
        let presentedToken = both.substr(indexDelim + 1);
        if (indexDelim < 0) return false;
        let actualToken = redisClient.hGet("app:" + appId, "apiToken");
        return (typeof actualToken !== "undefined" && actualToken === presentedToken);
    }
    return false;
}

//
// GET
//

async function getUserBySus(req, res) {
    // ASSERTIONS
    if (typeof req.params.sus === 'undefined') {
        return res.json({code: 400, method: "patchUserBySus", error: "sus is undefined"})
    }

    // QUERIES
    let balance = await redisClient.zScore("balance", "user:" + req.params.sus);
    let name = await redisClient.hGet("user:" + req.params.sus, "name");

    // RESPONSE
    return res.json({code: 200, method: "getUserBySus", response: {name: name, balance: balance}})
}

async function getUsers(req, res) {
    let n = req.query.n
    let inverted = req.query.inverted
    // ASSERTIONS
    if (typeof n === "undefined") {
        n = 0;
    }
    if (!Number.isInteger(n)) {
        return res.json({code: 400, method: "getUsers", error: "increment is NaN"})
    }
    if (typeof inverted === "undefined") {
        inverted = false;
    }
    if (typeof inverted !== "boolean") {
        return res.json({code: 400, method: "getUsers", error: "inverted is non-boolean"})
    }

    // QUERIES
    let result = await redisClient.zRange("balance", 0, n - 1, {REV: inverted})

    // RESPONSE
    return res.json({code: 200, method: "getUsers", response: result})
}

async function getAppByAppId(req, res) {
    // ASSERTIONS
    if (typeof req.params.appid === 'undefined') {
        return res.json({code: 400, method: "getAppByAppId", error: "appid is undefined"})
    }

    // QUERIES
    let apiToken = await redisClient.hGet("app:" + req.params.appid, "apiToken");
    let name = await redisClient.hGet("app:" + req.params.appid, "name");

    // RESPONSE
    return res.json({code: 200, method: "getAppByAppId", response: {name: name, apiToken: apiToken}})
}

async function patchUserBySus(req, res) {
    // ASSERTIONS
    let delta = 0
    if (typeof req.body.increment !== 'undefined') {
        if (!Number.isInteger(req.body.increment)) {
            return res.json({code: 400, method: "patchUserBySus", error: "increment is NaN"})
        }
        delta += Math.abs(req.body.increment)
    }
    if (typeof req.body.decrement !== 'undefined') {
        if (!Number.isInteger(req.body.decrement)) {
            return res.json({code: 400, method: "patchUserBySus", error: "decrement is NaN"})
        }
        delta -= Math.abs(req.body.decrement)
    }
    if (typeof req.body.decrement === 'undefined' && typeof req.body.increment === 'undefined') {
        return res.json({code: 400, method: "patchUserBySus", error: "Missing either increment or decrement"})
    }
    if (typeof req.params.sus === 'undefined') {
        return res.json({code: 400, method: "patchUserBySus", error: "sus is undefined"})
    }

    // RESPONSE
    try {
        await redisClient.zAdd("balance", {score: delta, value: "user:" + req.params.sus}, {XX: true, INCR: true})
    } catch (err) {
        return res.json({code: 400, method: "patchUserBySus", error: "Probably an unknown sus?"})
    }
    return res.json({code: 200, method: "patchUserBySus"})
}

//
// POST
//

async function postUser(req, res) {
    // ASSERTIONS
    if (typeof req.body.sus === 'undefined') {
        return res.json({code: 400, method: "postUser", error: "sus is undefined"})
    }
    if (typeof req.body.balance === 'undefined') {
        return res.json({code: 400, method: "postUser", error: "balance is undefined"})
    }
    if (!Number.isInteger(req.body.balance)) {
        return res.json({code: 400, method: "postUser", error: "balance is NaN"})
    }

    // ACTION
    try {
        await redisClient.zAdd("balance", {
            score: req.body.balance,
            value: "user:" + req.body.sus
        }, {NX: true}).then(value => {
            if (value === 0) {
                res.json({code: 400, method: "postUser", error: "Probably an existing sus?"})
            } else {
                redisClient.hSet("user:" + req.body.sus, "name", req.body.name, {NX: true});
                return res.json({code: 200, method: "postUser"})
            }
        })
    } catch (err) {
        console.log(err)
        return res.json({code: 400, method: "postUser", error: "Probably an existing sus?"})
    }
}

async function postApp(req, res) {
    // ASSERTIONS
    if (typeof req.body.appId === 'undefined') {
        return res.json({code: 400, method: "postApp", error: "appId is undefined"})
    }
    if (typeof req.body.name === 'undefined') {
        return res.json({code: 400, method: "postApp", error: "name is undefined"})
    }
    if (typeof req.body.apiToken === 'undefined') {
        return res.json({code: 400, method: "postApp", error: "apiToken is undefined"})
    }

    // ACTION
    await redisClient.HSET("app:" + req.body.appId, {
        apiToken: req.body.apiToken, name: req.body.name
    }, {NX: true}).then(() => {
        return res.json({code: 200, method: "postApp"})
    }).catch(() => {
        return res.json({code: 400, method: "postApp", error: "appId already in use"})
    })
}

//
// DELETE
//

async function deleteUserBySus(req, res) {
    // ASSERTIONS
    if (typeof req.params.sus === 'undefined') {
        return res.json({code: 400, method: "deleteUserBySus", error: "sus is undefined"})
    }

    // ACTION
    await redisClient.del("user:" + req.params.sus).then(value => {
        if (value !== 0) {
            return res.json({code: 400, method: "deleteUserBySus", error: "unknown sus?"})
        } else {
            redisClient.zRem("balance", "user:" + req.params.sus);
            return res.json({code: 200, method: "deleteUserBySus"})
        }
    });
}

async function deleteAppByAppId(req, res) {
    // ASSERTIONS
    if (typeof req.params.appid === 'undefined') {
        return res.json({code: 400, method: "deleteAppByAppId", error: "appId is undefined"})
    }


    await redisClient.del("app:" + req.params.appid).then(value => {
        if (value !== 0) {
            return res.json({code: 400, method: "deleteAppByAppId", error: "unknown appId?"})
        } else {
            return res.json({code: 200, method: "deleteAppByAppId"})
        }
    });
}

//
// EXPRESS REST API
//

const app = express()

app.use(bodyParser.json({strict: true}));

let adminRouter = express.Router()
adminRouter.get('/user/:sus', getUserBySus)
adminRouter.get('/app/:appid', getAppByAppId)
adminRouter.post('/user/', postUser)
adminRouter.post('/app/', postApp)
adminRouter.delete('/user/:sus', deleteUserBySus)
adminRouter.delete('/app/:appid', deleteAppByAppId)

let appRouter = express.Router()
appRouter.get('/user/:sus', getUserBySus)
appRouter.get('/user/', getUsers)
appRouter.patch('/user/:sus', patchUserBySus)

app.use('/v1/', function (req, res, next) {
    if (checkAdminSecret(req)) { //TODO Check Secret
        adminRouter(req, res, next)
    } else if (checkAPIKey(req)) {
        appRouter(req, res, next)
    } else {
        next()
    }
})

app.use('/*', (req, res) => {
    return res.status(401).json({code: 401, error: 'No Permission'})
})

async function start() {
    await redisClient.connect().then(() => {
        console.log(`Verbindung zu Redis auf ${process.env.REDIS_HOST}:${process.env.REDIS_PORT} hergestellt.`)
        app.listen(80, () =>
            console.log(`Express wurde gestartet.`)
        );
    })
}

start().then(() => {
});