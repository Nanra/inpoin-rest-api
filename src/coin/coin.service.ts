import { Body, Injectable, NotFoundException, Query } from "@nestjs/common";
import { CoinExchange } from "./coin.model";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';


@Injectable ()
export class CoinService {
    coinExchange : CoinExchange [] = []
    coins = [{coinId : 1, coinName : 'InPoin', coinAmmount : 100}, 
            {coinId : 2, coinName : 'Fiesta', coinAmmount : 100},
            {coinId : 3, coinName : 'Miles', coinAmmount : 100}
            ]

    exchangeRates = {
        '1': {
            coinName: 'Inpoin',
            rate: 1,
        },
        '2': {
            coinName: 'Fiesta',
            rate: 10,
        },
        '3': {
            coinName: 'Miles',
            rate: 200,
        }
    }     

    getCoins (){
        return [...this.coins]
    }

    getRate (exchangeRateQuery: ExchangeRateQueryDto){
        const { fromCoinId, toCoinId } = exchangeRateQuery
 
        if (toCoinId == '1') {
            const rate = this.exchangeRates[fromCoinId].rate
            return rate
        }

        if (fromCoinId == '1') {
            let rate = this.exchangeRates[toCoinId].rate
            rate = 1 / rate
            return rate
        }
        
        const inpoinRate = this.exchangeRates[fromCoinId].rate
        const finalRate = inpoinRate / this.exchangeRates[toCoinId].rate

        return finalRate
    }
    exchange (fromCoinId : string,  toCoinId : string, fromCoinAmmount : number){
        const newCoinExchange = new CoinExchange (fromCoinId, toCoinId, fromCoinAmmount)
        this.coinExchange.push(newCoinExchange)
        return this.coinExchange
    }
    getExchange (exchangeRateQuery: ExchangeRateQueryDto){
        const { fromCoinId, toCoinId, fromCoinAmmount } = exchangeRateQuery
        return this.coinExchange
    }
}