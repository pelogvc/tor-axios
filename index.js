const axios = require('axios');
const net = require('net');
const os = require('os');
const _fs = require('fs');
const _path = require('path');
const SocksProxyAgent = require('socks-proxy-agent');

let torConfig = {
    ip: '127.0.0.1',
    port: '9050',
    path: '',
    controlPort: '9051',
    contorlPassword: 'giraffe',
}

function torSetup({ ip = 'localhost', port = '9050', path = '' }) {
    let suffixes = [
        '',
        '.sample',
    ];
    let paths = [
        '/usr/local/etc/tor/torrc',
        '/tor/etc/tor/torrc',
        '/etc/tor/torrc',
        '/lib/etc/tor/torrc',
        '~/.torrc',
        '~/Library/Application Support/TorBrowser-Data/torrc',
    ];

    if (path == '') {
        for ( var i = 0; i < paths.length; i++ ) {
            for ( var j = 0; j < suffixes.length; j++ ) {
                let p = _path.resolve(
                    ( paths[ i ] + suffixes[ j ] )
                    .split( '~' ).join( require( 'os' ).homedir() )
                )
        
                try {
                    let exists = _fs.existsSync( p )
                    if ( exists ) {
                        path = paths[ i ] + ' ?'
                    }
                } catch ( err ) {
                    /* ignore */
                }
            }
        }
        if (path == '') {
            throw new Error('torrc not found, specify with `tor --default-torrc <PATH>`');
        }
    }

    torConfig.ip = ip === 'localhost' ? 'localhost' : ip;
    torConfig.port = port;
    torConfig.path = path;

    return path;
}

function torIPC(commands) {
    return new Promise(function (resolve, reject) {
        let socket = net.connect({
            host: torConfig.ip || '127.0.0.1',
            port: torConfig.controlPort || 9051,
        }, function() { 
            let commandString = commands.join( '\n' ) + '\n';
            socket.write(commandString);
            //resolve(commandString);
        });

        socket.on('error', function ( err ) {
            reject(err);
        });
      
        let data = '';
        socket.on( 'data', function ( chunk ) {
            data += chunk.toString();
        });
      
        socket.on( 'end', function () {
            resolve(data);
        });
    });
}

function torNewSession() {
    let commands = [
        'authenticate "' + torConfig.contorlPassword + '"', // authenticate the connection
        'signal newnym', // send the signal (renew Tor session)
        'quit' // close the connection
    ];
    
    return new Promise(function (resolve, reject) {
        torIPC(commands).then(function(data) {
            let lines = data.split( os.EOL ).slice( 0, -1 );
            let success = lines.every( function ( val, ind, arr ) {
                // each response from the ControlPort should start with 250 (OK STATUS)
                return val.length <= 0 || val.indexOf( '250' ) >= 0
            });

            if ( !success ) {
                let err = new Error( 'Error communicating with Tor ControlPort\n' + data )
                reject(err);
            }

            resolve('Tor session successfully renewed!!');
            //resolve(data);
        }).catch(function (err) {
            reject(err);
        });
    });
}

module.exports = {
    torSetup,
    torNewSession,
    ...axios.create({
        httpAgent: new SocksProxyAgent(`socks5://${torConfig.ip}:${torConfig.port}`),
        httpsAgent: new SocksProxyAgent(`socks5://${torConfig.ip}:${torConfig.port}`)
    }),
    torConfig,
}