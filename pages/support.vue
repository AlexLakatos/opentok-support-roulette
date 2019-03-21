<template>
  <div>
    <div id="videos">
      <div id="subscriber"></div>
      <div id="publisher"></div>
    </div>
  </div>
</template>

<script>
const OT = require('@opentok/client')

fetch('/api/new-support-session')
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
    initializeSession(json.key, json.session, json.token)
  })
// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message)
  }
}

// (optional) add server code here

function initializeSession(apiKey, sessionId, token) {
  const session = OT.initSession(apiKey, sessionId)

  // Create a publisher
  const publisher = OT.initPublisher(
    'publisher',
    {
      insertMode: 'append',
      width: '360px',
      height: '240px'
    },
    handleError
  )

  // Subscribe to a newly created stream
  session.on('streamCreated', event => {
    session.subscribe(
      event.stream,
      'subscriber',
      {
        insertMode: 'append',
        width: '50%',
        height: '100%'
      },
      handleError
    )
  })

  session.on('signal:chat', function(event) {
    // console.log("chat signal sent from connection " + event.from.id);
    // console.log("Signal data: " + event.data);
  })

  // Connect to the session
  session.connect(token, error => {
    // If the connection is successful, initialize a publisher and publish to the session
    if (error) {
      handleError(error)
    } else {
      session.publish(publisher, handleError)
    }
  })
}
</script>

<style>
#videos {
  position: relative;
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
}

.OT_subscriber.OT_fit-mode-contain {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 10;
}

.OT_subscriber.OT_fit-mode-cover {
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 10;
}

.OT_publisher {
  position: absolute;
  width: 360px;
  height: 240px;
  bottom: 10px;
  right: 10px;
  z-index: 100;
  border: 3px solid white;
  border-radius: 3px;
}
</style>
