export const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>This is the webview</title>
  </head>
  <body style="background-color: red">
    <h1 id="display">Start me</h1>
  </body>
  <script>
    function callTestMessageHandler(data) {
      document.getElementById('display').innerHTML = 'message received from react native';
      console.log('message received from react native');

      var message;
      try {
        // message = JSON.parse(e.data);
        message = parseInt(data);
        console.log(data);
        if (Number.isNaN(message) || !Number.isFinite(message)) {
          throw new Error('messed up', e);
        }
        document.getElementById('display').innerHTML = String(message);
        // Ping the message back to show it's been received
        console.log('message being pinged back to user', message);
        window['ReactNativeWebView'].postMessage(JSON.stringify({ message }));
      } catch (err) {
        console.error('failed to parse message from react-native ' + err);
        return;
      }
    }
  </script>
</html>
`;
