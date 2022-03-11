export class CoinExchange {
    constructor (
        public fromCoinId: string, 
        public toCoinId: string,
        public fromCoinAmmount: number,
        ) {}
}