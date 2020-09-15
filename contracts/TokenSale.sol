pragma solidity ^0.5.16;

import './Token.sol';

contract TokenSale {
    address admin;
    Token public token;
    uint256 public price;
    uint256 public sold;

    event Sell(address _buyer, uint256 _amount);

    constructor(Token _token, uint256 _price) public {
        admin = msg.sender;

        token = _token;
        price = _price;
    }

    // Inspired from this library:
    // https://github.com/dapphub/ds-math
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buy(uint256 _amount) public payable {
        require(msg.value == multiply(_amount, price));
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        sold += _amount;

        emit Sell(msg.sender, _amount);
    }
}
