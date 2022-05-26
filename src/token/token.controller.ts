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
import { ApiProperty, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

class TokenBalanceQuery {
  tokenId: string;
}
class CreateTokenDto {
  @ApiProperty({
    type: String,
    description: "The generated token Id"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "The desired token name"
  })
  tokenName: string;
}
class MintTokenDto {
  @ApiProperty({
    type: String,
    description: "The minter account"
  })
  account: string;
  @ApiProperty({
    type: String,
    description: "The minted token Id"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "The desired minting amount"
  })
  amount: string;
}
class TransferTokenDto {
  @ApiProperty({
    type: String,
    description: "The recipient username"
  })
  recipient: string;
  @ApiProperty({
    type: String,
    description: "The recipient organization"
  })
  recipientOrganization: string;
  @ApiProperty({
    type: String,
    description: "The token Id"
  })
  id: string;
  @ApiProperty({
    type: String,
    description: "The desired token amount"
  })
  amount: string;
}
class TokenExchangeDto {
  @ApiProperty({
    type: String,
    description: "The desired token Id to be received"
  })
  toTokenId: string;
  @ApiProperty({
    type: String,
    description: "The desired token Id to be exchanged"
  })
  fromTokenId: string;
  @ApiProperty({
    type: String,
    description: "The desired token ammount to be exchanged"
  })
  amount: string
}
class CreateLpDto {
  @ApiProperty({
    type: String,
    description: "The desired token Id to be added"
  })
  tokenId: string;
  @ApiProperty({
    type: String,
    description: "The desired non-native token amount to be added"
  })
  tokenSupply: string;
  @ApiProperty({
    type: String,
    description: "The desired native token amount to be added"
  })
  tokenPlatformSupply: string;
  @ApiProperty({
    type: String,
    description: "The exchange rate of non-native token to the native token"
  })
  exchangeRate: string
}
class SetPlatformFeeDto {
  @ApiProperty({
    type: String,
    description: "The desired platform token amount for transaction fee"
  })  
  platformFee: string;
}
class SetPlatformTokenIdDto {
  @ApiProperty({
    type: String,
    description: "The desired platform token Id"
  })
  tokenId: string;
}

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(JwtOtpGuard)
  @Get('user')
  @ApiOkResponse({ description: "The resource has been succesfully returned"})
  @ApiForbiddenResponse({ description: "Forbidden"})
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
  @ApiOkResponse({ description: "The resource has been succesfully returned"})
  @ApiForbiddenResponse({ description: "Forbidden"})
  getExchangeSummary(@Query() query: ExchangeRateQueryDto) {
    return this.tokenService.getExchangeSummary(query);
  }

  @UseGuards(JwtOtpGuard)
  @Get('balance/token')
  @ApiOkResponse({ description: "The resource has been succesfully returned"})
  @ApiForbiddenResponse({ description: "Forbidden"})
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
  @ApiOkResponse({ description: "Token has been created"})
  @ApiUnauthorizedResponse({ description: "Token name has been used"})
  createToken(
    @Req() { user: { username, organization } },
    @Body() body: CreateTokenDto,
  ) {
    const { tokenId, tokenName } = body;
    return this.tokenService.createToken(username, organization, tokenId, tokenName);
  }

  @UseGuards(JwtOtpGuard)
  @Post('mint')
  @ApiOkResponse({ description: "Token has been minted"})
  @ApiUnauthorizedResponse({ description: "Invalid"})
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
  @ApiOkResponse({ description: "Successful"})
  @ApiUnauthorizedResponse({ description: "Invalid"})
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
  @ApiOkResponse({ description: "Successful"})
  @ApiUnauthorizedResponse({ description: "Invalid"})
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
  @ApiOkResponse({ description: "Successful"})
  @ApiUnauthorizedResponse({ description: "Insufficient token amount"})
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
  @ApiOkResponse({ description: "Successful"})
  @ApiUnauthorizedResponse({ description: "Insufficient token amount"})
  newExchangeTransaction(
    @Req() {user:{ username, organization} },
    @Body() body: TokenExchangeDto,
  ) {
    const {fromTokenId, toTokenId, amount} = body
    const tx_type = "exchange";
    return this.tokenService.exchange(
      username, 
      organization, 
      fromTokenId, 
      toTokenId, 
      amount,
      tx_type);
    }

  @UseGuards(JwtOtpGuard)
  @Post('createLP')
  @ApiOkResponse({ description: "Successful"})
  @ApiUnauthorizedResponse({ description: "Insufficient token amount"})
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
  @ApiOkResponse({ description: "The resource has been succesfully returned"})
  @ApiForbiddenResponse({ description: "Forbidden"})
  async getLpByTokenId(
    @Req() { user: { username, organization } },
    @Query() { tokenId },
  ) {
    return this.tokenService.getLpByTokenId(username, organization, tokenId);
  }

  @UseGuards(JwtOtpGuard)
  @Get('transaction-history')
  @ApiOkResponse({ description: "The resource has been succesfully returned"})
  @ApiForbiddenResponse({ description: "Forbidden"})
  async getTransactionHistory(
    @Req() { user: { username } },
    @Query() { limit },
  ) {
    return this.tokenService.getTransactionHistory(username, limit);
  }
}
