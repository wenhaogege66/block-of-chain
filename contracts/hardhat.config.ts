import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '08ae3c456a5a229cb56e17fb57173fa00cc34075079f784b7aa6c1f5221037c5',
        'a8b2a09811c77b41967edd15c41160c29caff261bc4c03175148d92d49cb8caa',
        '48cb577b784aae69be012a24e11cdd0210742ae63ac498eb656141364ed0ae3f',
        'e87bb104bf2fba2c53e6a35c2d0868df2f5c9f48a04e7fec279a8e89a0b8ae8b',
      ]
    },
  },
};

export default config;
