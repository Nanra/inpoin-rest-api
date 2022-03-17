import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {
  async sendEmail() {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = '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';
    
    return apiKey
    
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = "My {{params.subject}}";
    sendSmtpEmail.htmlContent = "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>";
    sendSmtpEmail.sender = {"name":"John Doe","email":"emilliokanz@gmail.com"};
    sendSmtpEmail.to = [{"email":"petrikstamp@gmail.com","name":"Jane Doe"}];
    sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
    sendSmtpEmail.params = {"parameter":"My param value","subject":"New Subject"};
    
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, function(error) {
      console.error(error);
    });
  }
}
