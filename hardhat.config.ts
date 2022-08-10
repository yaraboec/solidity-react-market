import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const rinkebyKey: string | undefined = process.env.RINKEBY_PRIVATE_KEY;
if (!rinkebyKey) {
  throw new Error("Please set your Rinkeby private key in a .env file");
}

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Please set your Alchemy API key in a .env file");
}

export const chainIds = {
  localhost: 31337,
  hardhat: 31337,
  mainnet: 1,
  rinkeby: 4,
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [rinkebyKey],
    },
  },
  mocha: {
    timeout: 10000000,
  },
};

export default config;
