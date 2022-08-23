import { Nft } from "../typechain-types/contracts/Nft";
import Minter from "../types/MInter";
import { chainIds } from "./../hardhat.config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

export const tokenURI =
  "ipfs://bafyreih5ubkjmdpzmf4b4daytguypkynrf4a336aswflreeab6s6etpsra/metadata.json";

export const mintTokens = async (
  NftContract: Nft,
  owner: SignerWithAddress
) => {
  const createdTokenIds: string[] = [];

  await getMintedTokenId(createdTokenIds, NftContract, owner);
  await getMintedTokenId(createdTokenIds, NftContract, owner);
  await getMintedTokenId(createdTokenIds, NftContract, owner);

  return createdTokenIds;
};

const getMintedTokenId = async (
  tokenIds: string[],
  NftContract: Nft,
  owner: SignerWithAddress
) => {
  const minter = new Minter({ nftContract: NftContract });

  const lazyNft = await minter.create(
    chainIds.hardhat,
    ethers.utils.parseEther("0.00001")
  );

  const mintTx = await NftContract.connect(owner).mint(owner.address, lazyNft, {
    value: ethers.utils.parseEther("0.00001"),
  });

  const mintTxReceipt = await mintTx.wait(1);

  if (mintTxReceipt.events && mintTxReceipt.events[0].args) {
    tokenIds.push(mintTxReceipt.events[0]?.args.tokenId.toString());
  }
};

export const deployContract = async (contractName: string): Promise<any> => {
  const ContractFactory = await ethers.getContractFactory(contractName);

  return upgrades.deployProxy(ContractFactory);
};

export const callFailedFunction = async (
  callFunction: Promise<any>,
  expectedMessage: string
) => {
  await expect(callFunction).to.be.revertedWith(expectedMessage);
};
