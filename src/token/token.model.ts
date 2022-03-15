export class TokenExchange {
    constructor (
        public exchangeId: string,
        public fromTokenId: string, 
        public toTokenId: string,
        public fromTokenAmount: number,
        ) {}
}