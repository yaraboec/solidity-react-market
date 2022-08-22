import { ethers } from "ethers";
import fs from "fs";
import mime from "mime";
import { NFTStorage, File } from "nft.storage";
import path from "path";

const SING_DOMAIN_NAME = "YaraToken";
const SING_DOMAIN_VERSION = "1";

export default class Minter {
  contract: ethers.Contract;

  constructor({ nftContract }: { nftContract: ethers.Contract }) {
    this.contract = nftContract;
  }

  async create(mintPrice: ethers.BigNumber | number = 0, chainId: number) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY ?? "" });

    const image = await fileFromPath("scripts/test-pic.jpg");

    const metadata = await client.store({
      name: "yara",
      description: "boec",
      image,
    });

    const wallet = new ethers.Wallet(process.env.GOERLI_PRIVATE_KEY ?? "");

    const value = { mintPrice, uri: metadata.url.toString() };
    const domain = this.getDomain(chainId);
    const types = {
      LazyNFT: [
        { name: "mintPrice", type: "uint256" },
        { name: "uri", type: "string" },
      ],
    };

    const signature = await wallet._signTypedData(domain, types, value);

    return {
      ...value,
      signature,
    };
  }

  getDomain(chainId: number) {
    return {
      name: SING_DOMAIN_NAME,
      version: SING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
  }
}

async function fileFromPath(filePath: string) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath) ?? "";
  return new File([content], path.basename(filePath), { type });
}
