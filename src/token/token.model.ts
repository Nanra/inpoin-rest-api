export class TokenExchange {
    constructor (
        public fromTokenId: string, 
        public toTokenId: string,
        public fromTokenAmount: number,
        ) {}
}