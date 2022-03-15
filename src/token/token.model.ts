export class TokenExchange {
    constructor (
        public transId: string,
        public fromTokenId: string, 
        public toTokenId: string,
        public fromTokenAmmount: number,
        ) {}
}