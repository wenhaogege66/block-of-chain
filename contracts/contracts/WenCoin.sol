// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WenCoin is ERC20, Ownable {
    constructor(
        uint256 initialSupply
    ) ERC20("WenCoin", "WC") Ownable(msg.sender) {
        // 初始供应量铸造给合约部署者
        _mint(msg.sender, initialSupply);
    }

    // 合约所有者可以铸造新的代币
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 合约所有者可以销毁代币
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
}
