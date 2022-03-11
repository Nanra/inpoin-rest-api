import { Controller, Get,Post, Body, Query } from "@nestjs/common";
import { CoinService } from "./coin.service";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';

@Controller ('coins')
export class CoinController {
    constructor (private readonly coinService : CoinService){}

    @Get ('user') 
    getCoinList () {
        return this.coinService.getCoins();
    }
    @Get ('exchange-rate')
    getExchangeRate (@Query() query: ExchangeRateQueryDto){
        return this.coinService.getRate(query);
    }
    @Post('exchange')
    addTransaction(
        @Body('from token Id') fromTokenId: string,
        @Body('to token Id') toTokenId: string,
        @Body('from token ammount') fromTokenAmmount: number, 
    )  {
       return this.coinService.exchange(fromTokenId, toTokenId, fromTokenAmmount)
    }
    @Get ('exchange/summary')
    getExchangeSummary (@Query() query: ExchangeRateQueryDto){
        return this.coinService.getExchange (query);
    }

}