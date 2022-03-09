import { Controller, Get,Post, Body, Query } from "@nestjs/common";
import { CoinService } from "./coin.service";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';

@Controller ('coins')
export class CoinController {
    constructor (private readonly coinService : CoinService){}

    @Get () 
    getCoinList () {
        return this.coinService.getCoins();
    }
    @Get ('exchange-rate')
    getExchangeRate (@Query() query: ExchangeRateQueryDto){
        return this.coinService.getRate(query);
    }
    @Post('coin-exchange')
    addTransaction(
        @Body('from coin') fromCoinName: string,
        @Body('coin balance') fromCoinBalance: number,
        @Body('to coin') toCoinName: string,
    )  {
       return this.coinService.getExchangeTransaction(fromCoinName, fromCoinBalance, toCoinName,)
    }

}