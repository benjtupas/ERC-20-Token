var Token = artifacts.require('./Token.sol');
var TokenSale = artifacts.require('./TokenSale.sol');

const TOKEN_PRICE = 10000000000000000;
const TOKEN_SUPPLY = 1000000000;
const AVAILABLE_TOKENS = TOKEN_SUPPLY * 0.70;

contract('TokenSale', function(accounts) {
    it('Deployment - Sale, Token, Price', async function() {
        // TokenSale
        const sale = await TokenSale.deployed();
        assert(sale.address);

        // Token
        const token = await sale.token();
        assert(token);

        // Price
        const price = await sale.price();
        assert.equal(price, TOKEN_PRICE);
    });

    it('Buy - Success', async function() {
        const token = await Token.deployed();
        const sale = await TokenSale.deployed();

        const recepipt = await token.transfer(
            sale.address,
            AVAILABLE_TOKENS,
            { from : accounts[0]}
        );

        const numberOfTokens = 10;
        const wei = numberOfTokens * TOKEN_PRICE;
        const buyer = accounts[1];

        const receipt = await sale.buy(10, { from: buyer, value: wei });

        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Sell');
        assert.equal(receipt.logs[0].args._buyer, buyer);
        assert.equal(receipt.logs[0].args._amount, numberOfTokens);

        const sold = await sale.sold();
        assert.equal(sold.toNumber(), numberOfTokens);
    });

    it('Buy - Error', async function() {
        const sale = await TokenSale.deployed();

        const numberOfTokens = 10;
        const buyer = accounts[1];

        try{
            const receipt = await sale.buy(10, { from: buyer, value: 1 });
            assert(false);
        } catch(error) {
            assert(error);
        }
    });

    it('Buy - Sale about to complete', async function() {
        const sale = await TokenSale.deployed();

        const numberOfTokens = AVAILABLE_TOKENS + 1;
        const wei = numberOfTokens * TOKEN_PRICE;
        const buyer = accounts[1];

        try {
            const receipt = await sale.buy(
                numberOfTokens,
                { from: buyer, value: wei }
            );
            assert(false);
        } catch(error) {
            assert(error);
        }

    });
});
