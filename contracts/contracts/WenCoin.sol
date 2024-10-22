// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WenCoin is ERC20, Ownable {
    mapping(address => bool) claimedAirdropPlayerList;

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    // 合约所有者可以铸造新的代币
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 合约所有者可以销毁代币
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    function airdrop() external {
        require(
            claimedAirdropPlayerList[msg.sender] == false,
            "This user has claimed airdrop already"
        );
        _mint(msg.sender, 100000);
        claimedAirdropPlayerList[msg.sender] = true;
    }
}
