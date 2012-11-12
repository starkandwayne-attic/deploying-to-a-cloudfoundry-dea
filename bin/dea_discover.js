var nats = require('nats').connect();

// Simple Subscriber
nats.subscribe('>', function(msg, reply, subject) {
  console.log('Msg received on [' + subject + '] : ' + msg);
});

var message = {
  'runtime_info': {
    'name': 'ruby19',
    'executable': 'ruby',
    'version_output': 'ruby 1.9.3p286'
  },
  'limits': {
    'mem': 256
  },
  'droplet': 'DROPLET_ID_1234'
};
nats.request('dea.discover', JSON.stringify(message), function(response) {
  console.log("Got dea.discover response: " + response);
});