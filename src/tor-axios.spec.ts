import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { TorAxios } from './index';

const IP_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const URL = 'http://api.ipify.org';
const HTTPS_URL = 'https://api.ipify.org';

describe('TorAxios', () => {
  let tor: TorAxios;
  let realIp = '';
  let torIp = '';

  it('should create TorAxios instance', () => {
    tor = new TorAxios({
      ip: 'localhost',
      port: 9050,
      controlPort: '9051',
      controlPassword: 'giraffe',
    });

    expect(tor).toBeInstanceOf(TorAxios);
  });

  it('should return httpAgent', () => {
    const agent = tor.httpAgent();
    expect(agent).toBeDefined();
  });

  it('should return httpsAgent', () => {
    const agent = tor.httpsAgent();
    expect(agent).toBeDefined();
  });

  it('Check IP with HTTP', async () => {
    const response = await axios.get(URL);
    realIp = response.data;
    console.log('Real IP:', realIp);
    expect(IP_REGEX.test(realIp)).toBe(true);
  });

  it('Check IP with HTTP over Tor', async () => {
    const response = await tor.get<string>(URL);
    torIp = response.data;
    console.log('Tor IP:', torIp);
    expect(IP_REGEX.test(torIp)).toBe(true);
  });

  it('Check IP with HTTPS over Tor', async () => {
    const response = await tor.get<string>(HTTPS_URL);
    torIp = response.data;
    expect(IP_REGEX.test(torIp)).toBe(true);
  });

  it('Check realip and tor ip are different', () => {
    expect(realIp).not.toBe(torIp);
  });

  it('should refresh Tor session', async () => {
    const result = await tor.refreshSession();
    expect(result).toBe('Tor session successfully renewed!!');
  });

  it('Check Tor session IP change', async () => {
    const response = await tor.get<string>(URL);
    const newIp = response.data;
    console.log(`before: ${torIp}, after: ${newIp}`);
    expect(newIp).not.toBe(torIp);
    torIp = newIp;
  });

  it('should create TorAxios with axios config', () => {
    const torWithConfig = new TorAxios(
      { port: 9050 },
      { baseURL: 'https://api.example.com', timeout: 5000 }
    );
    expect(torWithConfig).toBeInstanceOf(TorAxios);
  });
});
