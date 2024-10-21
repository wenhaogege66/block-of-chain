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
        'a36207944508018d8e683adaec0a7fc2d0ca52d8b0a2c2e944d3d4014e41174e',
        'e0b9811de09f38cd1319e67844ae2402c413898e44a1ef66d04c90c59424b47c',
        'cb5742d345fbb84e6059e932f901a571917457442bf440b5454754470b823a0a',
        '8865114ce03a610e2ced5609c99e210a94c17bb48d7e2a064cce7d098ce1bc25',
      ]
    },
  },
};

export default config;
