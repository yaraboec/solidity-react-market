import { Nft } from "../typechain-types/contracts/Nft";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export const tokenURI =
  "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

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
  const mintTx = await NftContract.mint(owner.address, tokenURI);

  const mintTxReceipt = await mintTx.wait(1);

  if (mintTxReceipt.events && mintTxReceipt.events[0].args) {
    tokenIds.push(mintTxReceipt.events[0]?.args.tokenId.toString());
  }
};

export const deployContract = async (contractName: string): Promise<any> => {
  const ContractFactory = await ethers.getContractFactory(contractName);

  return ContractFactory.deploy();
};

export const callFailedFunction = async (
  callFunction: Promise<any>,
  expectedMessage: string
) => {
  await expect(callFunction).to.be.revertedWith(expectedMessage);
};
