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
  sender: string;
  recipient: string;
  id: string;
  amount: string;
}

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('user')
  getTokenList() {
    return this.tokenService.getTokens();
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
    return this.tokenService.exchange(fromTokenId, toTokenId, fromTokenAmount);
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
    const account = this.tokenService.getClientAccountId(
      username,
      organization,
    );
    return this.tokenService.mintToken(
      username,
      organization,
      await account,
      id,
      amount,
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
    const { sender, recipient, id, amount } = body;
    return this.tokenService.transferTokenFrom(
      username,
      organization,
      sender,
      recipient,
      id,
      amount,
    );
  }
}
