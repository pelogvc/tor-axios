import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import net from "net";
import os from "os";
import { SocksProxyAgent } from "socks-proxy-agent";

export interface TorConfig {
  ip: string;
  port: string | number;
  controlPort: string | number;
  controlPassword: string;
}

export interface TorSetupOptions {
  ip?: string;
  port?: string | number;
  controlPort?: string | number;
  controlPassword?: string;
}

export class TorAxios {
  private config: TorConfig;
  private axiosInstance: AxiosInstance;

  constructor(options: TorSetupOptions = {}) {
    const ip =
      options.ip === "localhost" ? "127.0.0.1" : (options.ip ?? "127.0.0.1");

    this.config = {
      ip,
      port: String(options.port ?? "9050"),
      controlPort: String(options.controlPort ?? "9051"),
      controlPassword: options.controlPassword ?? "giraffe",
    };

    this.axiosInstance = axios.create({
      httpAgent: this.createAgent(),
      httpsAgent: this.createAgent(),
    });
  }

  public httpAgent(): SocksProxyAgent {
    return this.createAgent();
  }

  public httpsAgent(): SocksProxyAgent {
    return this.createAgent();
  }

  public instance(): AxiosInstance {
    return this.axiosInstance;
  }

  public async newSession(): Promise<string> {
    const commands = [
      `authenticate "${this.config.controlPassword}"`,
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

  public get<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.get(url, config);
  }

  public post<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.post(url, data, config);
  }

  public put<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.put(url, data, config);
  }

  public patch<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.patch(url, data, config);
  }

  public delete<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.delete(url, config);
  }

  public head<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.head(url, config);
  }

  public options<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.options(url, config);
  }

  public request<T = unknown, R = AxiosResponse<T>>(
    config: AxiosRequestConfig
  ): Promise<R> {
    return this.axiosInstance.request(config);
  }

  private createAgent(): SocksProxyAgent {
    return new SocksProxyAgent(
      `socks5h://${this.config.ip}:${this.config.port}`
    );
  }

  private sendCommand(commands: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(
        {
          host: this.config.ip,
          port: Number(this.config.controlPort),
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
