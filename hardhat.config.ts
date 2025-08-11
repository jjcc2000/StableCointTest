import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const etherScanApyKey = process.env.API_Key_Token || "";
console.log(RPC_URL);

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: { apiKey: { sepolia: etherScanApyKey } }
};

export default config;
