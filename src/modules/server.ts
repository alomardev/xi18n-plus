import express, { Application } from 'express';
import path from 'path';

export class Server {

  readonly configs = {
    defaultPort: 5200,
    clientRoot: path.join(__dirname, '..', '..', 'web-client'),
    clientIndex: path.join(__dirname, '..', '..', 'web-client', 'index.html')
  };

  private instance: Application;

  constructor() {
    this.instance = express();
    this.instance.use(express.static(this.configs.clientRoot));
    this.setupEndpoints();
  }

  start(port?: number) {
    this.instance.listen(port || this.configs.defaultPort, () => {
      console.log(`Listening to ${port || this.configs.defaultPort}...`);
    });
  }

  private setupEndpoints() {
    this.instance.get('/', (req, res) => {
      res.sendFile(this.configs.clientIndex);
    });
  }

}