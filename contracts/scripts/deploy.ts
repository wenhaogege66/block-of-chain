import { ethers } from "hardhat";

async function main() {
  // 获取合约工厂
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");

  // 部署合约
  const buyMyRoom = await BuyMyRoom.deploy({});
  console.log("Deploying BuyMyRoom...");

  // 等待合约部署完成
  await buyMyRoom.deployed();

  // 输出部署后的合约地址
  console.log(`BuyMyRoom deployed to: ${buyMyRoom.address}`);
  const erc20 = await buyMyRoom.myERC20();
  console.log(`erc20 contract has been deployed successfully in ${erc20}`)
}

// 异常处理及退出
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
