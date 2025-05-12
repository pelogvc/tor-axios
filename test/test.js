const tor_axios = require('../index.js');
const axios = require('axios');

const tor = tor_axios.torSetup({
    ip: 'localhost',
    port: 9050,
    path: '',
    controlPort: '9051',
    contorlPassword: 'giraffe',
});

const url = "http://api.ipify.org";
const httpsUrl = "https://api.ipify.org";

describe('Tor test', function(){

    let realip = '';
    let torip = '';


    it('httpAgent function check', async function() {
        console.log(tor);
        await tor.httpAgent();
    }).timeout(100000);

    it('Check IP with HTTP', async function() {
        let response = await axios.get(url);
        realip = response.data;
        console.log(realip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(realip)){
            throw new Error('Connection Error');
        }

    }).timeout(100000);

    it('Check IP with HTTP over Tor', async function() {
        let torResponse = await tor.get(url);
        torip = torResponse.data;
        console.log(torip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(torip)){
            throw new Error('Connection Error');
        }
        
    }).timeout(10000);

    it('Check IP with HTTPS over Tor', async function() {
        let torResponse = await tor.get(httpsUrl);
        torip = torResponse.data;
        //console.log(torip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(torip)){
            throw new Error('Connection Error');
        }
        
    }).timeout(10000);

    it('Check realip and tor ip', function() {
        if ( realip === torip ) {
            throw new Error('Tor IP and current IP are the same');
        }
    })

    it('Tor Session Get a new session', async function() {
        await tor.torNewSession();
    });

    it('Check Tor new session IP change', async function() {
        let after = await tor.get(url);

        if ( torip === after.data ) {
            throw new Error('IP address cannot be changed');
        }

        console.log(`before: ${torip}, after: ${after.data}`);

        torip = after.data;
    }).timeout(100000);
    
})