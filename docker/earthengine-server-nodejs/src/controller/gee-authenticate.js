const ee = require('@google/earthengine');
const privateKey = require('../../auth/private-key.json');

module.exports = function authenticate(app, port) {
    return ee.data.authenticateViaPrivateKey(privateKey, () => {
        ee.initialize(null, null, () => {
          console.log('Earth Engine client library initialized.');
          app.listen(port, () => {
            console.log(`Listening on port ${port}`);
          });
        });
      }, (error) => {
        console.log(error);
      });
    }