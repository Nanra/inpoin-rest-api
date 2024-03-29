import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}
  async apiKey() {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = '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';
    
    return apiKey
  }

  async getConfig() {
    return {
      service: this.configService.get<string>('MAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      sender: this.configService.get<string>('MAIL_SENDER')
    }
  }
}
