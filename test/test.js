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

describe('토르 테스트', function(){

    let realip = '';
    let torip = '';


    it('httpAgent function check', async function() {
        console.log(tor);
        await tor.httpAgent();
    }).timeout(100000);

    it('http로 아이피 확인', async function() {
        let response = await axios.get(url);
        realip = response.data;
        console.log(realip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(realip)){
            throw new Error('연결 실패');
        }

    }).timeout(100000);

    it('http로 토르 아이피 확인', async function() {
        let torResponse = await tor.get(url);
        torip = torResponse.data;
        console.log(torip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(torip)){
            throw new Error('연결 실패');
        }
        
    }).timeout(10000);

    it('https로 토르 아이피 확인', async function() {
        let torResponse = await tor.get(httpsUrl);
        torip = torResponse.data;
        //console.log(torip);
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(torip)){
            throw new Error('연결 실패');
        }
        
    }).timeout(10000);

    it('realip와 tor아이피 확인', function() {
        if ( realip === torip ) {
            throw new Error('토르 아이피와 지금 아이피가 같음');
        }
    })

    it('토르 세션 새로운 세션 받기', async function() {
        await tor.torNewSession();
    });

    it('토르 새로운세션 아이피 변화 확인', async function() {
        let after = await tor.get(url);

        if ( torip === after.data ) {
            throw new Error('아이피 변경이 안됨');
        }

        console.log(`before: ${torip}, after: ${after.data}`);

        torip = after.data;
    }).timeout(100000);
    
})