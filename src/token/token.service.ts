import { Injectable } from "@nestjs/common";
import { TokenExchange } from "./token.model";
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';


@Injectable ()
export class TokenService {
    tokenExchange : TokenExchange [] = []
    tokens = [{tokenId : 1, tokenName : 'InPoin', tokenAmmount : 100}, 
            {tokenId : 2, tokenName : 'FiestaPoin', tokenAmmount : 100},
            {tokenId : 3, tokenName : 'Garuda Miles', tokenAmmount : 100}
            ]

    exchangeRates = {
        '1': {
            tokenName: 'Inpoin',
            rate: 1,
        },
        '2': {
            tokenName: 'Fiesta',
            rate: 10,
        },
        '3': {
            tokenName: 'Miles',
            rate: 200,
        }
    }     

    getTokens (){
        return [...this.tokens]
    }

    getRate (exchangeRateQuery: ExchangeRateQueryDto){
        const { fromTokenId, toTokenId } = exchangeRateQuery
 
        if (toTokenId == '1') {
            const rate = this.exchangeRates[fromTokenId].rate
            return rate
        }

        if (fromTokenId == '1') {
            let rate = this.exchangeRates[toTokenId].rate
            rate = 1 / rate
            return rate
        }
        
        const inpoinRate = this.exchangeRates[fromTokenId].rate
        const rate = inpoinRate / this.exchangeRates[toTokenId].rate

        return rate
    }
    exchange (fromTokenId : string,  toTokenId : string, fromTokenAmmount : number){
        const transId = Math.random().toString();
        const newTokenExchange = new TokenExchange (transId, fromTokenId, toTokenId, fromTokenAmmount)
        this.tokenExchange.push(newTokenExchange)
        return this.tokenExchange
    }
    getExchange (exchangeRateQuery: ExchangeRateQueryDto){
        const { toTokenId, fromTokenAmmount } = exchangeRateQuery
        const tokenRate = this.getRate(exchangeRateQuery)
        console.log('exchange rate', tokenRate)
        const toTokenExchangeAmmount = fromTokenAmmount * tokenRate
        const adminFee = 1000 / this.exchangeRates[toTokenId].rate
        const totalExchange = toTokenExchangeAmmount - adminFee

        return {fromTokenAmmount, toTokenExchangeAmmount, adminFee, totalExchange}
    }
    

}