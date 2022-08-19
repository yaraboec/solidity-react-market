import { ethers } from "hardhat";

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
  const [owner] = await ethers.getSigners();

  const marketAccount = process.env.MARKETPLACE_ACCOUNT;
  const nftAccount = process.env.NFT_ACCOUNT;

  if (!marketAccount || !nftAccount) return;

  const marketplaceContract = await ethers.getContractAt(
    "NftMarketplace",
    marketAccount
  );
  const nftContract = await ethers.getContractAt("Nft", nftAccount);

  console.log(`Minting NFT for ${owner.address}`);
  const mintTx = await nftContract
    .connect(owner)
    .mint(
      owner.address,
      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
    );
  const mintTxReceipt = await mintTx.wait(1);

  if (mintTxReceipt.events && mintTxReceipt.events[0].args) {
    const tokenId = mintTxReceipt.events[0]?.args.tokenId;

    console.log("Approving Marketplace as operator of NFT...");
    const approvalTx = await nftContract
      .connect(owner)
      .approve(marketplaceContract.address, tokenId);
    await approvalTx.wait(1);

    const tx = await marketplaceContract
      .connect(owner)
      .addSale(nftContract.address, tokenId, PRICE, {
        from: owner.address,
        gasLimit: 1000000,
      });
    await tx.wait(1);
    console.log("NFT Listed with token ID: ", tokenId.toString());
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
