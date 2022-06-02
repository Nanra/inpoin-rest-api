import axios, { AxiosInstance } from 'axios';
import { URLSearchParams } from 'url';
import * as hmacSHA256 from 'crypto-js/hmac-sha256';
import * as encHex from 'crypto-js/enc-hex';
import * as https from 'https';
import { SendCreditDto } from './dto/send-credit.dto';

const headers: Readonly<Record<string, string | boolean>> = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Credentials': true,
  'X-Requested-With': 'XMLHttpRequest',
};

export class PPOBService {
  dateTimeNow: string;
  username: string;
  password: string;
  terminal: string;
  apikey: string;
  privatekey: string;

  private instance: AxiosInstance;

  constructor() {
    this.dateTimeNow = new Date()
      .toISOString()
      .split('T')
      .join(' ')
      .split('.')[0];
    this.username = 'lpeblockchain@gmail.com';
    this.password = 'Ip3Blockchain';
    this.terminal = 'LPE-BLOCKCHAIN';
    this.apikey = 'T-MONEY_MzEwZmRmMGFjMmRiNmU0ZTE1MTUxOTE1YTMzMzNk';
    this.privatekey = 'T-MONEY_YWQzNzY4MjJhMGIwNmJjNGRhYzhjMGI3OTI0ZWZl';
  }

  private genSignature() {
    const credentialObj = {
      username: this.username,
      datetime: this.dateTimeNow,
      terminal: this.terminal,
      apiKey: this.apikey,
    };
    let credentialStr = '';
    Object.values(credentialObj).map((val) => {
      credentialStr += val;
    });

    return hmacSHA256(credentialStr, this.privatekey).toString(encHex);
  }

  private async initHttp() {
    const http = axios.create({
      baseURL: 'https://prodapi-app.tmoney.co.id/api',
      headers,
      withCredentials: true,
      timeout: 10000, //optional
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
    const initData = {
      idTmoney: '',
      idFusion: '',
      token: '',
    };

    const params = new URLSearchParams();
    params.append('userName', this.username);
    params.append('password', this.password);
    params.append('terminal', this.terminal);
    params.append('signature', this.genSignature());
    params.append('datetime', this.dateTimeNow);
    params.append('apiKey', this.apikey);

    await http
      .post('/sign-in', params)
      .then(({ data }) => {
        if (data.messageType != 'ERROR') {
          initData.idTmoney = data.user.idTmoney;
          initData.idFusion = data.user.idFusion;
          initData.token = data.user.token;

          return;
        }
        throw new Error(
          `\nResCode : ${data.resultCode}\nResDesc : ${data.resultDesc}`,
        );
      })
      .catch((e) => {
        console.error(e);
        //error handler emiter
      });

    this.instance = http;
    return initData;
  }

  async sendCredit(payload: SendCreditDto) {
    const { idTmoney, idFusion, token } = await this.initHttp();

    const paramsInquiry = new URLSearchParams();
    paramsInquiry.append('terminal', this.terminal);
    paramsInquiry.append('idTmoney', idTmoney);
    paramsInquiry.append('idFusion', idFusion);
    paramsInquiry.append('token', token);
    paramsInquiry.append('productCode', payload.productCode || 'TMONEYTSEL');
    paramsInquiry.append('destNumber', payload.destNumber);
    paramsInquiry.append('amount', payload.amount);
    paramsInquiry.append('apiKey', this.apikey);

    //inquiry
    await this.instance
      .post('/ppob/topup-prepaid/inquiry', paramsInquiry)
      .then(async ({ data }) => {
        console.log('\ninquiry\n', data);

        // payment
        const paramsPayment = new URLSearchParams();
        paramsPayment.append('terminal', this.terminal);
        paramsPayment.append('idTmoney', idTmoney);
        paramsPayment.append('idFusion', idFusion);
        paramsPayment.append('token', token);
        paramsPayment.append('transactionID', data.content.transactionID);
        paramsPayment.append('refNo', data.content.refNo);
        paramsPayment.append('pin', '448361');
        paramsPayment.append('apiKey', this.apikey);

        await this.instance
          .post('/ppob/topup-prepaid/payment', paramsPayment)
          .then(({ data }) => {
            console.log('\npayment\n', data);
          })
          .catch((e) => {
            console.error(e.response.data.content);
          });
      })
      .catch((e) => {
        console.error(e.response.data.content);
      });
  }

  async cekStatusPayment(trxId: string) {
    const { idTmoney, idFusion, token } = await this.initHttp();

    const params = new URLSearchParams();
    params.append('terminal', this.terminal);
    params.append('idTmoney', idTmoney);
    params.append('idFusion', idFusion);
    params.append('token', token);
    params.append('transactionID', trxId);
    params.append('apiKey', this.apikey);

    await this.instance
      .post('/ppob/check-status', params)
      .then(({ data }) => {
        console.log(data);
      })
      .catch((e) => {
        console.error(e.response.data.content);
      });
  }
}

// const test = new PPOBService();

// test
//   .sendCredit({
//     productCode: 'TMONEYTSEL',
//     destNumber: '081214881660',
//     amount: '5000',
//   })
//   .then(() => {
//     console.log('\ntransaction done');
//   });

// test.cekStatusPayment('195220602090746956');
