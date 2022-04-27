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
import { ApiProperty } from '@nestjs/swagger';

class TokenBalanceQuery {
  tokenId: string;
}
class CreateTokenDto {
  @ApiProperty({
    type: String,
    description: "the generated token Id"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "the desired token name"
  })
  tokenName: string;
}
class MintTokenDto {
  @ApiProperty({
    type: String,
    description: "the minter account"
  })
  account: string;
  @ApiProperty({
    type: String,
    description: "the minted token Id"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "the desired minting amount"
  })
  amount: string;
}
class TransferTokenDto {
  @ApiProperty({
    type: String,
    description: "the recipient username"
  })
  recipient: string;
  @ApiProperty({
    type: String,
    description: "the recipient organization"
  })
  recipientOrganization: string;
  @ApiProperty({
    type: String,
    description: "the token Id"
  })
  id: string;
  @ApiProperty({
    type: String,
    description: "the desired token amount"
  })
  amount: string;
}
class TokenExchangeDto {
  @ApiProperty({
    type: String,
    description: "the desired token Id to be received"
  })
  toTokenId: string;
  @ApiProperty({
    type: String,
    description: "the desired token Id to be exchanged"
  })
  fromTokenId: string;
  @ApiProperty({
    type: String,
    description: "the desired token ammount to be exchanged"
  })
  amount: string
}
class CreateLpDto {
  @ApiProperty({
    type: String,
    description: "the desired token Id to be added"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "the desired non-native token amount to be added"
  })
  tokenSupply: string;
  @ApiProperty({
    type: String,
    description: "the desired native token amount to be added"
  })
  tokenPlatformSupply: string;
  @ApiProperty({
    type: String,
    description: "the exchange rate of non-native token to the native token"
  })
  exchangeRate: string
}
class SetPlatformFeeDto {
  @ApiProperty({
    type: String,
    description: "the desired platform token amount for transaction fee"
  })  
  platformFee: string;
}
class SetPlatformTokenIdDto {
  @ApiProperty({
    type: String,
    description: "the desired platform token Id"
  })
  tokenId: string;
}

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(JwtOtpGuard)
  @Get('user')
  getTokenList(
    @Req() { user: { username, organization } },
    tokenId: string,
    ) {
    return this.tokenService.getTokens(
      username, 
      organization, 
      tokenId);
  }

  // @Get('exchange-rate')
  // getExchangeRate(@Query() query: ExchangeRateQueryDto) {
  //   return this.tokenService.getRate(query);
  // }

  // @Post('exchange')
  // addTransaction(
  //   @Body('fromTokenId') fromTokenId: string,
  //   @Body('toTokenId') toTokenId: string,
  //   @Body('fromTokenAmount') fromTokenAmount: number,
  // ) {
  //   return this.tokenService.newExchange(fromTokenId, toTokenId, fromTokenAmount);
  // }

  @Get('exchange/summary')
  getExchangeSummary(@Query() query: ExchangeRateQueryDto) {
    return this.tokenService.getExchange(query);
  }

  @UseGuards(JwtOtpGuard)
  @Get('balance/token')
  getTokenBalance(
    @Req() { user: { username, organization } },
    @Query() query: TokenBalanceQuery,
  ) {
    const { tokenId } = query;
    return this.tokenService.getClientAccountBalance(
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
    const { tokenId, tokenName } = body;
    return this.tokenService.createToken(username, organization, tokenId, tokenName);
  }

  @UseGuards(JwtOtpGuard)
  @Post('mint')
  async mintToken(
    @Req() { user: { username, organization } },
    @Body() body: MintTokenDto,
  ) {
    const { tokenId, amount } = body;
    const account = await this.tokenService.getClientAccountId(
      username,
      organization,
    );  
    return this.tokenService.mintToken(
      username,
      organization,
      account,
      tokenId,
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
    return this.tokenService.setPlatformTokenId(
      username,
      organization,
      tokenId,
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
    const { tokenId, tokenSupply, tokenPlatformSupply, exchangeRate } = body;
    return this.tokenService.createLp(
      username,
      organization,
      tokenId,
      tokenSupply,
      tokenPlatformSupply,
      exchangeRate,
    );
  }

  @UseGuards(JwtOtpGuard)
  @Get('lp')
  async getLpByTokenId(
    @Req() { user: { username, organization } },
    @Query() { tokenId },
  ) {
    return this.tokenService.getLpByTokenId(username, organization, tokenId);
  }

  @UseGuards(JwtOtpGuard)
  @Get('transaction-history')
  async getTransactionHistory(
    @Req() { user: { username } },
    @Query() { limit },
  ) {
    return this.tokenService.getTransactionHistory(username, limit);
  }
}
