const Token = artifacts.require("./Token.sol");
const TokenSale = artifacts.require("./TokenSale.sol");

module.exports = async function (deployer) {
    // Initial Supply: 1,000,000,000 Tokens
    // ETH and Wei Converter: https://eth-converter.com
    // 0.01 Ether in Wei
    deployer
        .deploy(Token, "Philippine Peso Tether", "PHPT", 1000000000)
        .then(function() {
            return deployer.deploy(TokenSale, Token.address, "10000000000000000");
        });
};
