import { Body, Injectable, NotFoundException, Query } from "@nestjs/common";
import { Coins } from "./coin.model";
// import { Coins } from "./coin.model";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';


@Injectable ()
export class CoinService {
    coins = [{coinId : 1, coinName : 'InPoin', coinBalance : 10, coinPrice : 1}, 
            {coinId : 2, coinName : 'Fiesta', coinBalance : 0, coinPrice : 10},
            {coinId : 3, coinName : 'Miles', coinBalance : 0, coinPrice : 200}
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

    getExchangeTransaction (fromCoin : string, fromCoinBalance : number, toCoin : string){
        const coinExchange = (this.coins[0].coinBalance * this.coins[1].coinPrice)
        fromCoin = (this.coins[0].coinName)
        fromCoinBalance = (this.coins[0].coinBalance)
        toCoin  = (this.coins[1].coinName)
        const newCoinExchangeTransaction = new Coins (fromCoin, fromCoinBalance, toCoin, coinExchange)
        return [newCoinExchangeTransaction]
    }
    // exchangeCoin(coin1: number, coinBalance: number, coin2: number){
    //     const newExchange = new Product(coin1, coinBalance, coin2);
    //     this.products.push(newProduct);
    //     return prodId;
    // }
}