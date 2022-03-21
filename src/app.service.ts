import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    // console.log(gateway);

    return 'Hello World!';
  }
}
