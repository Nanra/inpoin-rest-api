import { Injectable } from '@nestjs/common';
import { TokenExchange } from './token.model';
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';
import { FabricGatewayService } from 'src/fabric-gateway/fabric-gateway.service';
import { UsersService } from 'src/users/users.service';

const CHANNEL_NAME = 'inpoinchannel';
const CHAINCODE_ID = 'lp'; // name of the chaincode

@Injectable()
export class TokenService {
  constructor(
    private fabricGatewayService: FabricGatewayService,
    private userService: UsersService,
  ) {}

  tokenExchange: TokenExchange[] = [];
  tokens = [
    { tokenId: 1, tokenName: 'BUMNPoin', tokenAmount: 100 },
    { tokenId: 2, tokenName: 'LivinPoin', tokenAmount: 100 },
    { tokenId: 3, tokenName: 'MilesPoin', tokenAmount: 100 },
  ];

  exchangeRates = {
    '1': {
      tokenName: 'BUMNPoin',
      rate: 1,
    },
    '2': {
      tokenName: 'LivinPoin',
      rate: 10,
    },
    '3': {
      tokenName: 'MilesPoin',
      rate: 200,
    },
  };

  getTokens() {
    return [...this.tokens];
  }

  getRate(exchangeRateQuery: ExchangeRateQueryDto) {
    const { fromTokenId, toTokenId } = exchangeRateQuery;

    if (toTokenId == '1') {
      const rate = this.exchangeRates[fromTokenId].rate;
      return rate;
    }

    if (fromTokenId == '1') {
      let rate = this.exchangeRates[toTokenId].rate;
      rate = 1 / rate;
      return rate;
    }

    const inpoinRate = this.exchangeRates[fromTokenId].rate;
    const rate = inpoinRate / this.exchangeRates[toTokenId].rate;

    return rate;
  }

  exchange(fromTokenId: string, toTokenId: string, fromTokenAmount: number) {
    const exchangeId = new Date().toLocaleString();
    const newTokenExchange = new TokenExchange(
      exchangeId,
      fromTokenId,
      toTokenId,
      fromTokenAmount,
    );
    this.tokenExchange.push(newTokenExchange);
    return this.tokenExchange;
  }

  getExchange(exchangeRateQuery: ExchangeRateQueryDto) {
    const { toTokenId, fromTokenAmount } = exchangeRateQuery;
    const tokenRate = this.getRate(exchangeRateQuery);
    const toTokenExchangeAmount = fromTokenAmount * tokenRate;
    const adminFee = 1000 / this.exchangeRates[toTokenId].rate;
    const totalExchange = toTokenExchangeAmount - adminFee;
    return { fromTokenAmount, toTokenExchangeAmount, adminFee, totalExchange };
  }

  async getUserTokenBalance(
    username: string,
    organization: string,
    tokenId: number,
  ) {
    // Get token balance from blockchain
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);

    const args = [tokenId.toString()];
    const transactionName = 'ClientAccountBalance';

    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    console.log(submitResult);

    return submitResult.toString('utf-8');
  }

  async createToken(username: string, organization: string, tokenName: string) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);

    const args = [tokenName];
    const transactionName = 'CreateToken';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }

  async getClientAccountId(username: string, organization: string) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [];
    const transactionName = 'ClientAccountID';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }

  async getClientAccountBalance(
    username: string,
    organization: string,
    id: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [id];
    const transactionName = 'ClientAccountBalance';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );
    return submitResult.toString('utf-8');
  }

  async mintToken(
    username: string,
    organization: string,
    account: string,
    id: string,
    amount: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [account, id, amount];
    const transactionName = 'Mint';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }

  async transferTokenFrom(
    sender: string,
    senderOrganization: string,
    recipient: string,
    recipientOrganization: string,
    id: string,
    amount: string,
  ) {
    const senderAccountId = await this.getClientAccountId(
      sender,
      senderOrganization,
    );
    const recipientAccountId = await this.getClientAccountId(
      recipient,
      recipientOrganization,
    );

    console.log('senderAccountId', senderAccountId);
    console.log('recipientAccountId', recipientAccountId);

    const gateway = await this.fabricGatewayService.initGateway(
      sender,
      senderOrganization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [senderAccountId, recipientAccountId, id, amount];
    const transactionName = 'TransferFrom';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return {
      message: `transferred ${amount} of token id ${id} from ${sender} to ${recipient}`,
    };
  }
  async createLp (
    username: string,
    organization: string,
    tokenId: string,
    tokenSupply: string,
    tokenPlatformSupply: string
  ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [tokenId, tokenSupply, tokenPlatformSupply];
    const transactionName = 'CreateLp';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }
  async addToLP(
    username: string,
    organization: string,
    adderId: string,
    tokenId: string,
    amount: string,
  ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [adderId, tokenId, amount];
    const transactionName = 'AddToLp';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }
  async takeFromLp (
    username: string,
    organization: string,
    takerId: string,
    tokenId: string,
    amount: string,
  ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [takerId, tokenId, amount];
    const transactionName = 'TakeFromLp';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }
  async getLpByTokenId(
    username: string,
    organization: string,
    tokenId: string,
  ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [tokenId];
    const transactionName = 'GetLpByTokenId';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }
  async setPlatformFeeAmount (
    username: string,
    organization: string,
    platformFee: string,
  ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [platformFee];
    const transactionName = 'SetPlatformFeeAmount';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    return submitResult.toString('utf-8');
  }





}
