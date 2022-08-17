import { Nft, NftMarketplace } from "../typechain-types";
import { callFailedFunction, deployContract, mintTokens } from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";

chai.use(jestSnapshotPlugin());

describe("Marketplace contract", () => {
  let NftContract: Nft;
  let MarketplaceContract: NftMarketplace;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let tokensId: string[];

  before(async () => {
    [owner, user] = await ethers.getSigners();

    MarketplaceContract = await deployContract("NftMarketplace");
    NftContract = await deployContract("Nft");
  });

  describe("Create sale", () => {
    before(async () => {
      tokensId = await mintTokens(NftContract, owner);
    });

    it("Sale creation", async () => {
      await createSale(tokensId[0], "0.1");

      expect(await MarketplaceContract.getSalesSupply()).to.equal(1);

      const sale = await MarketplaceContract.getSale(tokensId[0]);

      expect({
        tokenId: sale[2].toString(),
        price: sale[0].toString(),
      }).toMatchSnapshot();
    });

    it("Sale creation should fail when price is zero", async () => {
      await callFailedFunction(
        createSale(tokensId[1], "0"),
        "Price must be greater than 0."
      );
    });

    it("Sale creation should fail when token does not belongs to caller", async () => {
      await callFailedFunction(
        MarketplaceContract.connect(user).addSale(
          NftContract.address,
          tokensId[1],
          ethers.utils.parseEther("0.1")
        ),
        "Only owner of token can call this method."
      );
    });

    it("Sale creation should fail when sale already exists", async () => {
      await createSale(tokensId[1], "0.1");

      await callFailedFunction(
        createSale(tokensId[1], "0.1"),
        "Sale already exists."
      );
    });

    it("Sale creation should fail when nft contact is not approved", async () => {
      await callFailedFunction(
        MarketplaceContract.addSale(
          NftContract.address,
          tokensId[2],
          ethers.utils.parseEther("0.1")
        ),
        "Market must be approved on nft."
      );
    });
  });

  describe("Remove sale", () => {
    before(async () => {
      tokensId = await mintTokens(NftContract, owner);

      await createSale(tokensId[0], "0.1");
    });

    it("Sale removing", async () => {
      const initialSupply = await MarketplaceContract.getSalesSupply();

      await callSaleRemove(tokensId[0]);
      await getSaleSnapshot(tokensId[0]);

      expect(await MarketplaceContract.getSalesSupply()).to.equal(
        initialSupply.sub(1)
      );
    });

    it("Sale removing should fail when sale does not belongs to caller", async () => {
      await callFailedFunction(
        MarketplaceContract.connect(user).removeSale(
          NftContract.address,
          tokensId[0]
        ),
        "Only owner of token can call this method."
      );
    });

    it("Sale removing should fail when sale does not exists", async () => {
      await callFailedFunction(
        callSaleRemove(tokensId[1]),
        "Sale must be listed."
      );
    });
  });

  describe("Buy sale", () => {
    before(async () => {
      tokensId = await mintTokens(NftContract, owner);

      await createSale(tokensId[0], "0.1");
      await createSale(tokensId[1], "0.1");
    });

    it("Sale purchase", async () => {
      const initialSupply = await MarketplaceContract.getSalesSupply();

      await callTokenPurchase(tokensId[0], ethers.utils.parseEther("0.1"));

      await getSaleSnapshot(tokensId[0]);

      expect(await MarketplaceContract.getSalesSupply()).to.equal(
        initialSupply.sub(1)
      );
      expect(await NftContract.ownerOf(tokensId[0])).to.equal(user.address);
    });

    it("Sale purchase should fail when sale is not exists", async () => {
      await callFailedFunction(
        callTokenPurchase(tokensId[0], ethers.utils.parseEther("0.1")),
        "Sale must be listed."
      );
    });

    it("Sale purchase should fail when insufficient deposit attached", async () => {
      await callFailedFunction(
        callTokenPurchase(tokensId[1], ethers.utils.parseEther("0")),
        "Deposit must equals sale price."
      );
    });
  });

  const createSale = async (tokenId: BigNumberish, price: string) => {
    await NftContract.approve(MarketplaceContract.address, tokenId);

    await MarketplaceContract.addSale(
      NftContract.address,
      tokenId,
      ethers.utils.parseEther(price)
    );
  };

  const callSaleRemove = (tokenId: string) =>
    MarketplaceContract.removeSale(NftContract.address, tokenId);

  const callTokenPurchase = (tokenId: string, value: BigNumber) =>
    MarketplaceContract.connect(user).tokenPurchase(
      NftContract.address,
      tokenId,
      {
        value,
      }
    );

  const getSaleSnapshot = async (tokenId: string) => {
    const sale = await MarketplaceContract.getSale(tokenId);

    expect({
      tokenId: sale[2].toString(),
      price: sale[0].toString(),
      owner: sale[1].toString(),
    }).toMatchSnapshot();
  };
});
