import { Injectable } from '@nestjs/common';
import { Gateway, Wallets } from 'fabric-network';
import { X509Identity, GatewayOptions } from 'fabric-network/types';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const WALLET_PATH = __dirname + '/../wallet';
const cryptoPath = __dirname + '/../organizations/peerOrganizations';
const certPath =
  cryptoPath +
  '/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem';
const privKeyPath =
  cryptoPath +
  '/org1.example.com/users/User1@org1.example.com/msp/keystore/1ba85e48cdc923e542c2d474fbe661da8c9b7c4fd19c693aefff8158bf9f4555_sk';

// Connection Profile reference
// https://hyperledger.github.io/fabric-sdk-node/release-2.2/tutorial-commonconnectionprofile.html
const data = fs.readFileSync(__dirname + '/../connection-profile.yaml');
const connectionProfile = yaml.load(data);

// Wallet reference
// https://hyperledger.github.io/fabric-sdk-node/release-2.2/tutorial-wallet.html
const cert = fs.readFileSync(certPath, { encoding: 'utf8' });
const privKey = fs.readFileSync(privKeyPath, { encoding: 'utf8' });
const identity: X509Identity = {
  credentials: {
    certificate: cert,
    privateKey: privKey,
  },
  mspId: 'Org1MSP',
  type: 'X.509',
};

async function createWallet() {
  const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
  await wallet.put('User1', identity);
  return wallet;
}

async function createGatewayOptions() {
  const wallet = await createWallet();
  const gatewayOptions: GatewayOptions = {
    identity: 'User1',
    wallet,
  };
  return gatewayOptions;
}

async function createGateway() {
  const gateway = new Gateway();
  const gatewayOptions = await createGatewayOptions();

  await gateway.connect(connectionProfile, gatewayOptions);

  return gateway;
}

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const gateway = await createGateway();
    console.log(gateway);

    return 'Hello World!';
  }
}
