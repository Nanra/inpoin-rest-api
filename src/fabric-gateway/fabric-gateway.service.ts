import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gateway, GatewayOptions, Wallet, Wallets } from 'fabric-network';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

@Injectable()
export class FabricGatewayService {
  constructor(private configService: ConfigService) {}
  private connectionProfile: any;

  async onModuleInit() {
    console.log('initializing fabric gateway');
    // Initialize connectionProfile
    const CONNECTION_PROFILE_PATH = this.configService.get<string>(
      'CONNECTION_PROFILE_PATH',
    );
    // console.log('CONNECTION_PROFILE_PATH', CONNECTION_PROFILE_PATH);

    // Comment this for Local Dev
    const data = fs.readFileSync(CONNECTION_PROFILE_PATH);
    this.connectionProfile = yaml.load(data);


    // console.log(this.connectionProfile.peers['peer0.org1.example.com'].grpcOptions);
  }

  async initWallet(organization: string) {
    // Initialize wallet path
    const WALLET_BASE_PATH = this.configService.get<string>('WALLET_BASE_PATH');
    let orgWalletPath = '';
    switch (organization) {
      case 'Org1':
        orgWalletPath = 'org1-wallet';
        break;
      case 'Org2':
        orgWalletPath = 'org2-wallet';
        break;
      case 'Org3':
        orgWalletPath = 'org3-wallet';
        break;
      default:
        throw new Error(`wallet for ${organization} not found`);
    }
    const walletPath = path.join(WALLET_BASE_PATH, orgWalletPath);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    return wallet;
  }

  async initGateway(username: string, organization: string) {
    const wallet = await this.initWallet(organization);
    const gateway = new Gateway();
    const gatewayOptions: GatewayOptions = {
      identity: username,
      wallet,
    };
    await gateway.connect(this.connectionProfile, gatewayOptions);

    return gateway;
  }
}
