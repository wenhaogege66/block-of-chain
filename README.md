# ZJU-blockchain-course-2024
## 如何运行

更多过程心得以及截图请看文件夹下的.doxc文件

1. 在本地启动ganache应用,端口http://localhost:8545。
2. 修改hardhat.config里你的用户私钥
3. 在 `./contracts` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```
4. 在 `./contracts` 中编译合约和部署合约，并运行如下的命令：
    ```bash
    npx hardhat compile
    npx hardhat run ./scripts/deploy.ts --network ganache
    ```
5. 将部署合约得到的地址修改到前端的contract-addresses，同时吧生成的abi也拷贝到前端 utils/abis里面：
6. 在 `./frontend` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```
8. 在 `./frontend` 中启动前端程序，运行如下的命令：
    ```bash
    npm run start
    ```

注意:第一次登录需要连接你的metamask账户,可以从ganache里复制私钥直接导入metamask账号；
注意:连接好账户以后，切换账户或信息未及时更新时刷新一下即可


## 功能实现分析

1. 创建一个（ERC721）合约，在合约中发行房屋集合，每个NFT代表一栋房屋，让部分用户免费领取部分房屋NFT——区块链合约部署相关知识
2. 用户查看自己拥有的房产列表。并可以挂单出售自己的房屋——访问区块链合约
3. 允许用户将测试以太币兑换成ERC20积分，并使用ERC20积分完成购买房屋——学习和使用模板里的ERC20即可
4. 平台收取手续费等基础的房屋交易功能

## 截图

见.doxc文件

## 参考内容

- 课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。

- 快速实现 ERC721 和 ERC20：[模版](https://wizard.openzeppelin.com/#erc20)。记得安装相关依赖 ``"@openzeppelin/contracts": "^5.0.0"``。

- 如何实现ETH和ERC20的兑换？ [参考讲解](https://www.wtf.academy/en/docs/solidity-103/DEX/)

如果有其它参考的内容，也请在这里陈列。
