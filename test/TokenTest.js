var Token = artifacts.require("./Token.sol");
var TOKEN_SUPPLY = 1000000000;
var TOKEN_NAME = "Philippine Peso Tether";
var TOKEN_SYMBOL = "PHPT"

contract(Token, function(accounts) {

    it("Contract Deployment - Total Supply", async function() {
        const token = await Token.deployed();

        const supply = await token.totalSupply();
        assert.equal(supply, TOKEN_SUPPLY);

        const balance = await token.balanceOf(accounts[0]);
        assert.equal(balance, TOKEN_SUPPLY);
    });

    it("Contract Deployment - Token Name", async function() {
        const token = await Token.deployed();

        const name = await token.name();
        assert.equal(TOKEN_NAME, name);
    });

    it("Contract Deployment - Token Symbol", async function() {
        const token = await Token.deployed();

        const symbol = await token.symbol();
        assert.equal(TOKEN_SYMBOL, symbol);
    });

    it('Transfer - Successful', async function() {
        const amount = 250000;

        const token = await Token.deployed();

        // Transfer
        const receipt = await token.transfer(
            accounts[1],
            amount,
            { from : accounts[0] }
        );

        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Transfer');
        assert.equal(receipt.logs[0].args._from, accounts[0]);
        assert.equal(receipt.logs[0].args._to, accounts[1]);
        assert.equal(receipt.logs[0].args._value, amount);

        // Check the balance
        const balance0 = await token.balanceOf(accounts[0]);
        assert.equal(balance0.toNumber(), TOKEN_SUPPLY - amount);

        const balance1 = await token.balanceOf(accounts[1]);
        assert.equal(balance1.toNumber(), amount);
    });

    it('Transfer - Insufficient Balance', async function() {
        const token = await Token.deployed();

        try {
            await token.transfer(accounts[1], 9999999999999999);
            assert(false);
        } catch(error) {
            assert(error);
        }
    });

    it('Approval', async function() {
        const amount = 100;
        const token = await Token.deployed();

        const receipt = await token.approve(
            accounts[1],
            amount,
            { from : accounts[0] }
        );

        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Approval');
        assert.equal(receipt.logs[0].args._owner, accounts[0]);
        assert.equal(receipt.logs[0].args._spender, accounts[1]);
        assert.equal(receipt.logs[0].args._value, amount);
    });

    it('Allowance', async function() {
        const amount = 100;
        const token = await Token.deployed();

        const allowance = await token.allowance(accounts[0], accounts[1]);

        assert.equal(allowance, amount);
    });

    it('Delegated Transfer - exchanges and wallets', async function() {
        const startingBalance = 100;
        const allowedAmount = 10;
        const token = await Token.deployed();

        const admin = accounts[0];
        const sender = accounts[2];
        const receiver = accounts[3];
        const exchange = accounts[4];

        token.transfer(sender, startingBalance, { from : admin });
        token.approve(exchange, allowedAmount, { from : sender });

        // Larger than the sender balance
        try {
            await token.transferFrom(
                sender,
                receiver,
                startingBalance + 1,
                { from : exchange }
            );
            assert(false);
        } catch(error) {
            assert(error);
        }

        // Larger than the approved amount
        try {
            await token.transferFrom(
                sender,
                receiver,
                allowedAmount + 1,
                { from : exchange }
            );
            assert(false);
        } catch(error) {
            assert(error);
        }

        // Equal or less than approved amount
        const receipt = await token.transferFrom(
            sender,
            receiver,
            allowedAmount,
            { from : exchange }
        );

        // Receipt
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, 'Transfer');
        assert.equal(receipt.logs[0].args._from, sender);
        assert.equal(receipt.logs[0].args._to, receiver);
        assert.equal(receipt.logs[0].args._value, allowedAmount);

        // Check balances
        const balanceSender = await token.balanceOf(sender);
        assert.equal((startingBalance - allowedAmount), balanceSender.toNumber());

        const balanceReceiver = await token.balanceOf(receiver);
        assert.equal(allowedAmount, balanceReceiver.toNumber());

        const balanceExchange = await token.balanceOf(exchange);
        assert.equal(0, balanceExchange.toNumber());
    });
});
