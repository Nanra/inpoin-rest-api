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
  @Get('balance')
  getTokenBalance(@Query() query: TokenBalanceQuery) {
    const { tokenId } = query;
    return this.tokenService.getTokenBalance(tokenId);
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
}
