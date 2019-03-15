# tor-axios

axios through tor network

## Installing

Using npm:

```
$ npm install tor-axios
```

## example

```js
const tor_axios = require('tor-axios');
const tor = tor_axios.torSetup({
	ip: 'localhost',
	port: 9050,
})

let response = await tor.get('http://api.ipify.org');
let ip = response.data;
console.log(ip);
```

or

```js
const tor_axios = require('tor-axios');
const axios = require('axios');

const tor = tor_axios.torSetup({
	ip: 'localhost',
	port: 9050,
})

const inst = axios.create({
	httpAgent: tor.httpAgent(),
	httpsagent: tor.httpsAgent(),
});

let response = await inst.get('http://api.ipify.org');
let ip = response.data;
console.log(ip);
```



## Requirements

On Debian you can install and run a relatively up to date Tor with.

```
apt-get install tor # should auto run as daemon after install
```

On OSX you can install with homebrew

```
brew install tor
tor & # run as background process
```

## Enable Tor ControlPort

You need to enable the Tor ControlPort if you want to programmatically refresh the Tor session (i.e., get a new proxy IP address) without restarting your Tor client.

```
tor --hash-password giraffe
```

The last line of the output contains the hash password that you copy paste into torrc

```
Jul 21 13:08:50.363 [notice] Tor v0.2.6.10 (git-58c51dc6087b0936) running on Darwin with Libevent 2.0.22-stable, OpenSSL 1.0.2h and Zlib 1.2.5.
Jul 21 13:08:50.363 [notice] Tor can't help you if you use it wrong! Learn how to be safe at https://www.torproject.org/download/download#warning
16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```

Copy the generated hash password and add it to your torrc file

```
# sample torrc file 
ControlPort 9051
HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF
```

After Example,

```js
const tor_axios = require('tor-axios');
const tor = tor_axios.torSetup({
	ip: 'localhost',
	port: 9050,
	controlPort: '9051',
    controlPassword: 'giraffe',
})

let response = await tor.get('http://api.ipify.org');
let ip = response.data;
console.log(ip);

await tor.torNewSession(); //change tor ip

response = await tor.get('http://api.ipify.org');
ip = response.data;
console.log(ip);
```

## Test

use http://api.ipify.org api

```
mocha test/test.js
```

## LICENSE

MIT