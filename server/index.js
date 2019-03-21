require('dotenv').config({
  path: __dirname + '/../.env'
});
const express = require('express')
const consola = require('consola')
const bodyParser = require('body-parser')
const {
  Nuxt,
  Builder
} = require('nuxt')

const app = express()
app.use(bodyParser.json());

const OpenTok = require('opentok');
const opentok = new OpenTok(process.env.TOKBOX_API_KEY, process.env.TOKBOX_API_SECRET);

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

let iddleSessions = [];
let supportSessions = [];

app.get('/api/new-support-session', function(req, res) {
  if (iddleSessions.length > 0) {
    let sessionId = iddleSessions.pop()
    supportSessions.push(sessionId)
    res.json({
      key: process.env.TOKBOX_API_KEY,
      session: sessionId,
      token: opentok.generateToken(sessionId, {
        data: "support"
      })
    });
  } else {
    opentok.createSession({
      mediaMode: "routed",
      archiveMode: 'always'
    }, (err, session) => {
      if (err) return console.log(err);

      supportSessions.push(session.sessionId);
      res.json({
        key: process.env.TOKBOX_API_KEY,
        session: session.sessionId,
        token: opentok.generateToken(session.sessionId, {
          data: "support"
        })
      })
    });
  }
})

app.get('/api/new-help-session', function(req, res) {
  let interval = setInterval(() => {
    if (supportSessions.length > 0) {
      let sessionId = supportSessions.pop()
      clearInterval(interval)
      res.json({
        key: process.env.TOKBOX_API_KEY,
        session: sessionId,
        token: opentok.generateToken(sessionId, {
          data: "help"
        })
      });
    }
  }, 1000);
})

app.post('/api/session-monitor', function(req, res) {
  console.log(req.body.sessionId);

  if (req.body.event === "connectionDestroyed") {
    if (req.body.connection.data === "help") {
      //supportSessions.push(req.body.sessionId)
      opentok.signal(req.body.sessionId, null, { 'type': 'chat', 'data': 'connectionDestroyed' }, function(error) {
        if (error) return console.log("error:", error);
      });
    } //else {
    //   if (supportSessions.length > 0) {
    //     supportSessions = supportSessions.filter(sessionId => sessiondId != req.body.sessionId)
    //   }
    //   if (iddleSessions.length > 0) {
    //     iddleSessions = iddleSessions.filter(sessionId => sessiondId != req.body.sessionId)
    //   }
    //   console.log(supportSessions, iddleSessions);
    // }
  }

  res.send('OK');
})

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host,
    port
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)
  // for parsing application/json
  //app.use(bodyParser.urlencoded({ extended: true }));

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
