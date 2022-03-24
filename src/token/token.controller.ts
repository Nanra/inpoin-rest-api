import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';
import { JwtOtpGuard } from 'src/auth/jwt-otp.guard';

class TokenBalanceQuery {
  tokenId: number;
}
class CreateTokenDto {
  tokenName: string;
}
class MintTokenDto {
  account: string;
  id: string;
  amount: string;
}
class TransferTokenDto {
  recipient: string;
  recipientOrganization: string;
  id: string;
  amount: string;
}
class TokenExchangeDto {
  toTokenId: string;
  fromTokenId: string;
  amount: string
}
class CreateLpDto {
  tokenId: string;
  tokenSupply: string;
  tokenPlatformSupply: string;
  exchangeRate: string
}
class SetPlatformFeeDto {
  platformFee: string;
}
class SetPlatformTokenIdDto {
  tokenId: string;
}

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(JwtOtpGuard)
  @Get('user')
  getTokenList(username: string, organization: string, id: string) {
    return this.tokenService.getTokens(username, organization, id);
  }

  @Get('exchange-rate')
  getExchangeRate(@Query() query: ExchangeRateQueryDto) {
    return this.tokenService.getRate(query);
  }

  @Post('exchange')
  addTransaction(
    @Body('fromTokenId') fromTokenId: string,
    @Body('toTokenId') toTokenId: string,
    @Body('fromTokenAmount') fromTokenAmount: number,
  ) {
    return this.tokenService.newExchange(fromTokenId, toTokenId, fromTokenAmount);
  }

  @Get('exchange/summary')
  getExchangeSummary(@Query() query: ExchangeRateQueryDto) {
    return this.tokenService.getExchange(query);
  }

  @UseGuards(JwtOtpGuard)
  @Get('balance/user')
  getTokenBalance(
    @Req() { user: { username, organization } },
    @Query() query: TokenBalanceQuery,
  ) {
    const { tokenId } = query;
    return this.tokenService.getUserTokenBalance(
      username,
      organization,
      tokenId,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Post('create')
  createToken(
    @Req() { user: { username, organization } },
    @Body() body: CreateTokenDto,
  ) {
    const { tokenName } = body;
    return this.tokenService.createToken(username, organization, tokenName);
  }

  @UseGuards(JwtOtpGuard)
  @Post('mint')
  async mintToken(
    @Req() { user: { username, organization } },
    @Body() body: MintTokenDto,
  ) {
    const { id, amount } = body;
    const account = await this.tokenService.getClientAccountId(
      username,
      organization,
    );  
    return this.tokenService.mintToken(
      username,
      organization,
      account,
      id,
      amount,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Post('setplatformfee')
  async setPlatformFeeAmount (
    @Req() { user: { username, organization } },
    @Body() body: SetPlatformFeeDto,
  ) {
    const { platformFee } = body; 
    return this.tokenService.setPlatformFeeAmount(
      username,
      organization,
      platformFee,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Post('setplatformtoken')
  async setPlatformTokenId (
    @Req() { user: { username, organization } },
    @Body() body: SetPlatformTokenIdDto,
  ) {
    const { tokenId } = body;  
    return this.tokenService.setPlatformFeeAmount(
      username,
      organization,
      tokenId,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Get('account')
  getClientAccountBalance(username: string, organization: string, id: string) {
    return this.tokenService.getClientAccountBalance(
      username,
      organization,
      id,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Post('transfer')
  async transferToken(
    @Req() { user: { username, organization } },
    @Body() body: TransferTokenDto,
  ) {
    const { recipient, recipientOrganization, id, amount } = body;

    return this.tokenService.transferTokenFrom(
      username,
      organization,
      recipient,
      recipientOrganization,
      id,
      amount,
    );
  }
  @UseGuards(JwtOtpGuard)
  @Post('exchange')
  newExchangeTransaction(
    @Req() {user:{ username, organization} },
    @Body() body: TokenExchangeDto,
  ) {
    const {fromTokenId, toTokenId, amount} = body
    return this.tokenService.exchange(
      username, 
      organization, 
      fromTokenId, 
      toTokenId, 
      amount);
    }

  @UseGuards(JwtOtpGuard)
  @Post('createLP')
  async createLp(
    @Req() { user: { username, organization } },
    @Body() body: CreateLpDto,
  ) {
    const { tokenId } = body;
    const tokenSupply = await this.tokenService.getLpByTokenId(username, organization, tokenId);
    const tokenPlatformSupply = await this.tokenService.getPlatformTokenId(username, organization);
    const exchangeRate = await this.tokenService.getPlatformFeeAmount(username, organization) ;
    return this.tokenService.transferTokenFrom(
      username,
      organization,
      tokenId,
      tokenSupply,
      tokenPlatformSupply,
      exchangeRate,
    );
  }
}
