// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./WenCoin.sol";

contract BuyMyRoom is ERC721Enumerable, Ownable {
    // 房产ID计数器
    uint256 private _currentTokenId = 0;
    uint256 public platformFeePercent = 1; // 平台手续费比例，按百分比计算
    WenCoin public myERC20; // 相关的代币合约
    address public manager;

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    // 房产结构
    struct House {
        uint id; // 房产ID
        address owner; // 房产所有者
        uint256 listedTimestamp; // 房产上架时间
        address payable to; // 收款地址
        uint256 houseprice; // 房价
        bool forSale; // 是否挂牌出售
    }

    mapping(uint256 => House) public houses; // 房产信息映射

    // 事件
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseSold(
        uint256 tokenId,
        uint256 price,
        address buyer,
        address seller
    );
    event UserAddressHash(bytes32 hash);

    // 构造函数：在部署时给指定的前三个用户每人铸造 3 个房产NFT
    constructor() ERC721("HouseToken", "HST") Ownable(msg.sender) {
        myERC20 = new WenCoin("WenCoin", "WC");
        manager = msg.sender;
        // 给前三个预定义的用户铸造房产NFT
        address[3] memory initialUsers = [
            0x0650bE2053B6130119829fA54a06AA79CA4B44e6, // 用户1地址
            0x260d14d5fB4b436155FDdce95197A0024069ab00, // 用户2地址
            0x4444702d9d970d2EE7B51DE8756Ea46d5A81258c // 用户3地址
        ];

        // 给每个初始用户铸造 3 个房产NFT
        for (uint256 i = 0; i < initialUsers.length; i++) {
            for (uint256 j = 0; j < 3; j++) {
                mintHouse(initialUsers[i]);
            }
        }
    }

    // 铸造房产NFT
    function mintHouse(address to) public onlyOwner {
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        // 铸造NFT
        _mint(to, newTokenId);

        // 初始化房产信息
        houses[newTokenId] = House({
            id: newTokenId,
            owner: to,
            listedTimestamp: 0,
            to: payable(to),
            houseprice: 0,
            forSale: false
        });
    }

    // 挂牌出售房产
    function listHouseForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this house");
        require(price > 0, "Price must be greater than 0");

        // 更新房产信息
        houses[tokenId].houseprice = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].forSale = true;

        emit HouseListed(tokenId, price, msg.sender);
    }

    function buyHouse(uint256 tokenId) public payable {
        House memory house = houses[tokenId];
        require(house.forSale, "House is not for sale");
        require(msg.sender != house.owner, "This house is already yours");
        // require(msg.value == house.houseprice, "Incorrect value sent"); // 检查发送的价格是否和房价一致

        // 平台手续费 = 上架时长 * 固定比例 * 房价
        uint256 timeListed = block.timestamp - house.listedTimestamp;
        uint256 platformFee = (timeListed *
            platformFeePercent *
            house.houseprice) / 100;

        // 将房款转给卖家，扣除手续费
        myERC20.transferFrom(
            msg.sender,
            house.owner,
            house.houseprice - platformFee
        );
        // 将手续费转给合约所有者
        myERC20.transferFrom(msg.sender, owner(), platformFee);
        // 更新房产信息
        _transfer(house.owner, msg.sender, tokenId);
        houses[tokenId].owner = payable(msg.sender);
        houses[tokenId].forSale = false;

        emit HouseSold(tokenId, house.houseprice, msg.sender, house.owner);
    }

    // 获取用户的所有房产
    function getHousesByOwner(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 houseCount = balanceOf(owner);
        uint256[] memory result = new uint256[](houseCount);
        for (uint256 i = 0; i < houseCount; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        return result;
    }

    // 获取所有正在出售的房产
    function getHousesForSale() public view returns (uint256[] memory) {
        uint256 houseCount = totalSupply(); // 获取所有房产的数量
        uint256[] memory forSaleHouses = new uint256[](houseCount); // 初始化房产ID数组
        uint256 index = 0;

        // 遍历所有房产并筛选出出售中的房产
        for (uint256 i = 0; i < houseCount; i++) {
            uint256 tokenId = tokenByIndex(i); // 获取房产ID
            if (houses[tokenId].forSale) {
                // 如果房产处于出售状态
                forSaleHouses[index] = tokenId;
                index++;
            }
        }

        // 调整数组长度以适应出售中的房产
        uint256[] memory result = new uint256[](index);
        for (uint256 i = 0; i < index; i++) {
            result[i] = forSaleHouses[i];
        }
        return result;
    }

    // 查询指定房产的详细信息
    function getHouseDetails(
        uint256 tokenId
    )
        public
        view
        returns (
            address owner,
            uint256 price,
            bool forSale,
            uint256 listedTimestamp,
            uint id
        )
    {
        House memory house = houses[tokenId];
        return (
            house.owner,
            house.houseprice,
            house.forSale,
            house.listedTimestamp,
            house.id
        );
    }

    // 平台手续费设置
    function setPlatformFeePercent(uint256 feePercent) public onlyOwner {
        platformFeePercent = feePercent;
    }

    function getUserAddressHash() external returns (bytes32) {
        //        console.log(msg.sender);
        bytes32 hash = keccak256(abi.encodePacked(msg.sender));
        emit UserAddressHash(hash);
        return hash;
    }
}
