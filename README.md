# tor-axios

axios through tor network

## Installing

```bash
npm install tor-axios axios
# or
pnpm add tor-axios axios
```

## Usage

```typescript
import { TorAxios } from "tor-axios";

const tor = new TorAxios({
  ip: "localhost",
  port: 9050,
});

const response = await tor.get("http://api.ipify.org");
console.log(response.data);
```

### Using with custom axios instance

```typescript
import axios from "axios";
import { TorAxios } from "tor-axios";

const tor = new TorAxios({
  ip: "localhost",
  port: 9050,
});

const instance = axios.create({
  httpAgent: tor.httpAgent(),
  httpsAgent: tor.httpsAgent(),
});

const response = await instance.get("http://api.ipify.org");
console.log(response.data);
```

## Requirements

On Debian you can install and run a relatively up to date Tor with.

```bash
apt-get install tor # should auto run as daemon after install
```

On OSX you can install with homebrew

```bash
brew install tor
tor & # run as background process
```

## Enable Tor ControlPort

You need to enable the Tor ControlPort if you want to programmatically refresh the Tor session (i.e., get a new proxy IP address) without restarting your Tor client.

If you installed Tor via Homebrew, run the following to set up torrc:

```bash
# Copy sample config file
cp /opt/homebrew/etc/tor/torrc.sample /opt/homebrew/etc/tor/torrc

# Enable ControlPort
echo "ControlPort 9051" >> /opt/homebrew/etc/tor/torrc

# Set hashed password (e.g. giraffe)
# echo "HashedControlPassword $(tor --hash-password giraffe | tail -1)" >> /opt/homebrew/etc/tor/torrc
echo "HashedControlPassword $(tor --hash-password {YOUR_PASSWORD} | tail -1)" >> /opt/homebrew/etc/tor/torrc

# Restart Tor service
brew services restart tor
```

Then you can refresh your Tor session programmatically:

```typescript
import { TorAxios } from "tor-axios";

const tor = new TorAxios({
  ip: "localhost",
  port: 9050,
  controlPort: 9051,
  controlPassword: "{YOUR_PASSWORD}", // controlPassword: "giraffe",
});

let response = await tor.get("http://api.ipify.org");
console.log(response.data);

await tor.newSession();

response = await tor.get("http://api.ipify.org");
console.log(response.data);
```

## Test

```bash
pnpm test
```

## LICENSE

MIT
