import { Injectable } from '@nestjs/common';
import { TokenExchange } from './token.model';
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';
import { FabricGatewayService } from 'src/fabric-gateway/fabric-gateway.service';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeTransaction } from './echange-transaction.entity';
import { Repository } from 'typeorm';
import { Contract } from 'fabric-network';

const CHANNEL_NAME = 'inpoinchannel';
const CHAINCODE_ID = 'lp'; // name of the chaincode

@Injectable()
export class TokenService {
  constructor(
    private fabricGatewayService: FabricGatewayService,
    private userService: UsersService,
    @InjectRepository(ExchangeTransaction)
    private exchangeTransactionRepository: Repository<ExchangeTransaction>,
  ) {}

  tokenExchange: TokenExchange[] = [];

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

  getExchange(exchangeRateQuery: ExchangeRateQueryDto) {
    const { toTokenId, fromTokenAmount } = exchangeRateQuery;
    const tokenRate = this.getRate(exchangeRateQuery);
    const toTokenExchangeAmount = fromTokenAmount * tokenRate;
    const adminFee = 1000 / this.exchangeRates[toTokenId].rate;
    const totalExchange = toTokenExchangeAmount - adminFee;
    return { fromTokenAmount, toTokenExchangeAmount, adminFee, totalExchange };
  }

  async getTokens(username: string, organization: string, tokenId: string) {
    const bumnPoinBalance = Number(
      await this.getClientAccountBalance(
        username,
        organization,
        (tokenId = '1'),
      ),
    );
    const livinPoinBalance = Number(
      await this.getClientAccountBalance(
        username,
        organization,
        (tokenId = '2'),
      ),
    );
    const milesPoinBalance = Number(
      await this.getClientAccountBalance(
        username,
        organization,
        (tokenId = '3'),
      ),
    );

    const tokens = [
      { tokenId: 1, tokenName: 'BUMNPoin', tokenAmount: bumnPoinBalance },
      { tokenId: 2, tokenName: 'LivinPoin', tokenAmount: livinPoinBalance },
      { tokenId: 3, tokenName: 'MilesPoin', tokenAmount: milesPoinBalance },
    ];
    return [...tokens];
  }

  async getClientAccountBalance(
    username: string,
    organization: string,
    tokenId: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);

    const args = [tokenId];
    const transactionName = 'ClientAccountBalance';

    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );

    const result = submitResult.toString('utf-8');

    return Number(result);
  }

  async createToken(
    username: string,
    organization: string,
    tokenId: string,
    tokenName: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);

    const args = [tokenId, tokenName];
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
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      const result = submitResult.toString('utf-8');

      return Number(result);
    } catch (err) {
      console.log(err);
      return err;
    }
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
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return {
        message: `transferred ${amount} of token id ${id} from ${sender} to ${recipient}`,
      };
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async createLp(
    username: string,
    organization: string,
    tokenId: string,
    tokenSupply: string,
    tokenPlatformSupply: string,
    exchangeRate: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [tokenId, tokenSupply, tokenPlatformSupply, exchangeRate];
    const transactionName = 'CreateLP';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async addToLP(
    username: string,
    organization: string,
    adderId: string,
    tokenId: string,
    amount: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [adderId, tokenId, amount];
    const transactionName = 'AddToLp';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async takeFromLp(
    username: string,
    organization: string,
    takerId: string,
    tokenId: string,
    amount: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [takerId, tokenId, amount];
    const transactionName = 'TakeFromLp';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async getLpByTokenId(
    username: string,
    organization: string,
    tokenId: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [tokenId];
    const transactionName = 'GetLPByTokenID';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async setPlatformFeeAmount(
    username: string,
    organization: string,
    platformFee: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [platformFee];
    const transactionName = 'SetPlatformFeeAmount';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );
      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async setPlatformTokenId(
    username: string,
    organization: string,
    tokenId: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [tokenId];
    const transactionName = 'SetPlatformTokenID';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );

      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async getPlatformTokenId(username: string, organization: string) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [];
    const transactionName = 'GetPlatformTokenId';
    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );
      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async getPlatformFeeAmount(username: string, organization: string) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [];
    const transactionName = 'GetPlatformFeeAmount';

    try {
      const submitResult = await contract.submitTransaction(
        transactionName,
        ...args,
      );
      return submitResult.toString('utf-8');
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async saveLpState(username: string, organization: string) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [];
    const transactionName = 'SaveLPState';
    const submitResult = await contract.submitTransaction(
      transactionName,
      ...args,
    );
    return submitResult.toString('utf-8');
  }

  async getTokenName(contract: Contract, tokenId: string) {
    const transactionName = 'GetTokenName';
    const transaction = contract.createTransaction(transactionName);
    const submitResult = await transaction.submit(tokenId.toString());
    return submitResult.toString('utf-8');
  }

  async exchange(
    username: string,
    organization: string,
    fromTokenId: string,
    toTokenId: string,
    amount: string,
  ) {
    const gateway = await this.fabricGatewayService.initGateway(
      username,
      organization,
    );
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_ID);
    const args = [fromTokenId, toTokenId, amount];
    const transactionName = 'Exchange';
    const transaction = contract.createTransaction(transactionName);
    const submitResult = await transaction.submit(...args);
    const result = JSON.parse(submitResult.toString('utf-8'));
    const txId = transaction.getTransactionId();

    const from_token_name = await this.getTokenName(contract, fromTokenId);
    const to_token_name = await this.getTokenName(contract, toTokenId);

    const exchangeTransaction = {
      username,
      from_token_id: result.FromTokenID,
      from_token_name,
      to_token_id: result.ToTokenID,
      to_token_name,
      from_token_amount: result.FromTokenAmount,
      to_token_amount: result.ToTokenAmount,
      exchange_rate: result.ExchangeRate,
      fee_token_id: result.ToTokenID,
      fee_token_name: to_token_name,
      fee_amount: result.PlatformFee,
      tx_id: txId,
    };

    await this.exchangeTransactionRepository.save(exchangeTransaction);

    return {
      ...result,
      txId,
    };
  }

  async getTransactionHistory(username: string, limit: number) {
    const result = this.exchangeTransactionRepository.find({
      take: limit,
      order: {
        created_at: 'DESC',
      },
      where: { username },
    });

    return result;
  }
}
