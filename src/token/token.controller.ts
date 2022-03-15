import { Controller, Get,Post, Body, Query } from "@nestjs/common";
import { TokenService } from "./token.service";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';

@Controller ('tokens')
export class TokenController {
    constructor (private readonly tokenService : TokenService){}

    @Get ('user') 
    getTokenList () {
        return this.tokenService.getTokens();
    }
    @Get ('exchange-rate')
    getExchangeRate (@Query() query: ExchangeRateQueryDto){
        return this.tokenService.getRate(query);
    }
    @Post('exchange')
    addTransaction(
        @Body('from token Id') fromTokenId: string,
        @Body('to token Id') toTokenId: string,
        @Body('from token ammount') fromTokenAmmount: number, 
    )  {
       return this.tokenService.exchange(fromTokenId, toTokenId, fromTokenAmmount)
    }
    @Get ('exchange/summary')
    getExchangeSummary (@Query() query: ExchangeRateQueryDto){
        return this.tokenService.getExchange (query);
    }

}