import { Axios, type AxiosRequestConfig } from "axios";
import net from "net";
import os from "os";
import { SocksProxyAgent } from "socks-proxy-agent";
import type { TorSetupOptions } from "./tor-axios.interface";

export class TorAxios extends Axios {
  private torConfig: {
    ip: string;
    port: string;
    controlPort: string;
    controlPassword: string;
  };

  constructor(setupOptions: TorSetupOptions = {}, axiosConfig: AxiosRequestConfig = {}) {
    const ip =
      setupOptions.ip === "localhost" ? "127.0.0.1" : (setupOptions.ip ?? "127.0.0.1");
    const port = String(setupOptions.port ?? "9050");

    const agent = new SocksProxyAgent(`socks5h://${ip}:${port}`);

    super({
      ...axiosConfig,
      httpAgent: agent,
      httpsAgent: agent,
    });

    this.torConfig = {
      ip,
      port,
      controlPort: String(setupOptions.controlPort ?? "9051"),
      controlPassword: setupOptions.controlPassword ?? "giraffe",
    };
  }

  public httpAgent(): SocksProxyAgent {
    return new SocksProxyAgent(
      `socks5h://${this.torConfig.ip}:${this.torConfig.port}`
    );
  }

  public httpsAgent(): SocksProxyAgent {
    return new SocksProxyAgent(
      `socks5h://${this.torConfig.ip}:${this.torConfig.port}`
    );
  }

  public async refreshSession(): Promise<string> {
    const commands = [
      `authenticate "${this.torConfig.controlPassword}"`,
      "signal newnym",
      "quit",
    ];

    const data = await this.sendCommand(commands);
    const lines = data.split(os.EOL).slice(0, -1);
    const success = lines.every(
      (val) => val.length <= 0 || val.includes("250")
    );

    if (!success) {
      throw new Error(`Error communicating with Tor ControlPort\n${data}`);
    }

    return "Tor session successfully renewed!!";
  }

  private sendCommand(commands: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(
        {
          host: this.torConfig.ip,
          port: Number(this.torConfig.controlPort),
        },
        () => {
          socket.write(commands.join("\n") + "\n");
        }
      );

      socket.on("error", (err: Error) => reject(err));

      let data = "";
      socket.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });

      socket.on("end", () => resolve(data));
    });
  }
}
