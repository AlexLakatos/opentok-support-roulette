<template>
  <div>
    <div id="videos">
      <div id="subscriber"></div>
      <div id="publisher"></div>
    </div>
    <div class="controls">
      <button type="button" name="screenshare">Start ScreenShare</button>
    </div>
  </div>
</template>

<script>
const OT = require('@opentok/client')

fetch('/api/new-help-session')
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
  const sharer = OT.initPublisher(
    'publisher',
    {
      insertMode: 'append',
      videoSource: 'screen',
      width: '360px',
      height: '240px'
    },
    handleError
  )

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
        width: '100%',
        height: '100%'
      },
      handleError
    )
  })

  // Connect to the session
  session.connect(token, error => {
    // If the connection is successful, initialize a publisher and publish to the session
    if (error) {
      handleError(error)
    } else {
      session.publish(publisher, handleError)
      session.publish(sharer, handleError)
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

.OT_subscriber {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.OT_publisher.OT_fit-mode-contain {
  position: absolute;
  width: 360px;
  height: 240px;
  bottom: 10px;
  right: 10px;
  z-index: 100;
  border: 3px solid white;
  border-radius: 3px;
}

.OT_publisher.OT_fit-mode-cover {
  position: absolute;
  width: 360px;
  height: 240px;
  bottom: 260px;
  right: 10px;
  z-index: 100;
  border: 3px solid white;
  border-radius: 3px;
}
</style>
