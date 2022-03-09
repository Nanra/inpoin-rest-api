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
        @Body('from coin Id') fromCoinId: string,
        @Body('from coin ammount') fromCoinAmmount: number,
        @Body('to coin Id') toCoinId: string, 
    )  {
       return this.coinService.exchange(fromCoinId, fromCoinAmmount, toCoinId)
    }

}