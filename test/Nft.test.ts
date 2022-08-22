import { Nft } from "../typechain-types";
import {
  callFailedFunction,
  deployContract,
  mintTokens,
  tokenURI,
} from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

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
        NftContract.mint(owner.address, {
          mintPrice: ethers.utils.parseEther("0.00001"),
          uri: "123",
          signature:
            "0x3a5a20cb8dfea56087c7a70ed3d57057e4f923332ab940c776dffbd243cf5883283bfb641410586793b23bc2bf382f369e02f3bc7af3c4b6e7ddd94d359f53151c",
        }),
        "Signer is not allowed to mint."
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
