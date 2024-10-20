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
        '0x2ec76457bcab7e63fb2fb623daa69815c4f51676d78a65c8f4c5dd9a556e3964',
        '0x2251bb450a11bf41b296cf740b347ff4e3f9458a65be6246f4c19fb7acbbeb3c',
      ]
    },
  },
};

export default config;
