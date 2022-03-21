import { Injectable } from '@nestjs/common';
import { RegisterEnrollDto } from './dto/register-enroll.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Wallets } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaService {
  constructor(private configService: ConfigService) {}

  async registerAndEnrollUser(payload: RegisterEnrollDto): Promise<any> {
    const { username, userOrg } = payload;
    const ccp = await this.getCCP(userOrg);
    const caURL = await this.getCaUrl(userOrg, ccp);

    const ca = new FabricCAServices(caURL);

    const walletPath = await this.getWalletPath(userOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
      console.log(
        `An identity for the user ${username} already exists in the wallet`,
      );
      const response = {
        success: true,
        message: username + ' enrolled Successfully',
      };
      return response;
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin" does not exist in the wallet',
      );
      await this.enrollAdmin(userOrg);
      adminIdentity = await wallet.get('admin');
      console.log('Admin Enrolled Successfully');
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    let secret;
    try {
      // Register the user, enroll the user, and import the new identity into the wallet.
      secret = await ca.register(
        {
          affiliation: await this.getAffiliation(userOrg),
          enrollmentID: username,
          role: 'client',
        },
        adminUser,
      );
    } catch (error) {
      return error.message;
    }

    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret,
    });

    let mspId;
    if (userOrg == 'Org1') {
      mspId = 'Org1MSP';
    } else if (userOrg == 'Org2') {
      mspId = 'Org2MSP';
    } else if (userOrg == 'Org3') {
      mspId = 'Org3MSP';
    }

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId,
      type: 'X.509',
    };

    await wallet.put(username, x509Identity);
    console.log(
      `Successfully registered and enrolled admin user ${username} and imported it into the wallet`,
    );

    const response = {
      success: true,
      message: username + ' enrolled Successfully',
    };
    return response;
  }

  async enrollAdmin(adminOrg: string): Promise<any> {
    const ccp = await this.getCCP(adminOrg);
    const caInfo = await this.getCaInfo(adminOrg, ccp);
    const caTlsCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTlsCACerts, verify: false },
      caInfo.caName,
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = await this.getWalletPath(adminOrg); //path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get('admin');
    if (identity) {
      const resp = `An identity for the admin user "admin" already exists in the wallet for ${adminOrg}`;
      return resp;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
    });

    let mspId;
    if (adminOrg == 'Org1') {
      mspId = 'Org1MSP';
    } else if (adminOrg == 'Org2') {
      mspId = 'Org2MSP';
    } else if (adminOrg == 'Org3') {
      mspId = 'Org3MSP';
    }

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId,
      type: 'X.509',
    };

    await wallet.put('admin', x509Identity);
    const resp = `Successfully enrolled admin user "admin" and imported it into the wallet for ${adminOrg}`;
    return resp;
  }

  async getCCP(org: string) {
    const orgBasePath = this.configService.get<string>(
      'ORGANIZATIONS_BASE_PATH',
    );
    let connectionFilePath;
    if (org == 'Org1') {
      connectionFilePath =
        'peerOrganizations/org1.example.com/connection-org1.json';
    } else if (org == 'Org2') {
      connectionFilePath =
        'peerOrganizations/org2.example.com/connection-org2.json';
    } else if (org == 'Org3') {
      connectionFilePath =
        'peerOrganizations/org3.example.com/connection-org3.json';
    } else {
      return null;
    }
    const ccpPath = path.resolve(orgBasePath, connectionFilePath);
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    return ccp;
  }

  async getCaUrl(org, ccp) {
    let caURL;
    if (org == 'Org1') {
      caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    } else if (org == 'Org2') {
      caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
    } else if (org == 'Org3') {
      caURL = ccp.certificateAuthorities['ca.org3.example.com'].url;
    } else {
      return null;
    }
    return caURL;
  }

  async getWalletPath(org: string) {
    const walletBasePath = this.configService.get<string>('WALLET_BASE_PATH');
    let walletPath;
    if (org == 'Org1') {
      walletPath = path.join(walletBasePath, 'org1-wallet');
    } else if (org == 'Org2') {
      walletPath = path.join(walletBasePath, 'org2-wallet');
    } else if (org == 'Org3') {
      walletPath = path.join(walletBasePath, 'org3-wallet');
    } else {
      return null;
    }
    return walletPath;
  }

  async getCaInfo(org: string, ccp: any) {
    let caInfo;
    if (org == 'Org1') {
      caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    } else if (org == 'Org2') {
      caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
    } else if (org == 'Org3') {
      caInfo = ccp.certificateAuthorities['ca.org3.example.com'];
    } else return null;
    return caInfo;
  }

  async getAffiliation(org) {
    if (org == 'Org1') return 'org1.department1';
    if (org == 'Org2') return 'org2.department1';
    if (org == 'Org3') return 'org3.department1';
    throw new Error(`${org} does not exist`);
  }
}
