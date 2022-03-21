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

  getTokenBalance(tokenId: number) {
    // Get token balance from blockchain
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

    console.log(submitResult);

    return submitResult;
  }
  async getClientAccountId( username: string, organization: string ){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [];
    const transactionName = 'GetUserAccountId';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,)

      return submitResult.toString()
  }
  async getClientAccountBalance(username: string, organization: string, id: string){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    let args = [id]; 
    const transactionName = 'ClientAccountBalance';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,)
    return submitResult
  }
  async mintToken(username: string, organization: string, account: string, id : string, amount : string){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    let args = [account, id, amount]; 
    const transactionName = 'MintToken';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,)

      return submitResult
  }
  async transferTokenFrom(
    username: string, 
    organization: string, 
    sender: string, 
    recipient: string, 
    id: string,
    amount : string){
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    let args = [sender, recipient, id, amount]; 
    const transactionName = 'TransferTokenFrom';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,)

      return submitResult
    }
}
