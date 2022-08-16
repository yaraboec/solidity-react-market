import {
  callFailedFunction,
  deployContract,
  mintTokens,
  tokenURI,
} from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Nft } from "../typechain-types";

describe("Nft contract", () => {
  let NftContract: Nft;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let tokensId: string[];

  before(async () => {
    [owner, user] = await ethers.getSigners();

    NftContract = await deployContract("Nft");
  });

  describe("Mint", () => {
    it("Mint tokens", async () => {
      const tokenSupply = await NftContract.totalSupply();

      tokensId = await callMintTokens();

      expect(await NftContract.totalSupply()).to.equal(tokenSupply.add(3));
      expect(await NftContract.tokenURI(tokensId[0])).to.equal(tokenURI);
      expect(await NftContract.tokenURI(tokensId[1])).to.equal(tokenURI);
      expect(await NftContract.tokenURI(tokensId[2])).to.equal(tokenURI);
    });

    it("Mint tokens should fail when called by not minter", async () => {
      await callFailedFunction(
        NftContract.connect(user).mint(owner.address, tokenURI),
        "AccessControl: account 0xfbd030ba82f68f0e64c279f97ca498f38ca24a77 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
      );
    });
  });

  describe("Burn", () => {
    it("Burn tokens should fail when called by not token owner", async () => {
      tokensId = await callMintTokens();

      await callFailedFunction(
        NftContract.connect(user).burn(tokensId[0]),
        "Only owner of the token can burn it."
      );
    });

    it("Burn tokens", async () => {
      tokensId = await callMintTokens();

      const tokenSupply = await NftContract.totalSupply();

      await NftContract.burn(tokensId[0]);

      expect(await NftContract.totalSupply()).to.equal(tokenSupply.sub(1));

      await callFailedFunction(
        NftContract.tokenURI(tokensId[0]),
        "ERC721: invalid token ID"
      );
    });
  });

  const callMintTokens = async () => {
    return mintTokens(NftContract, owner);
  };
});
