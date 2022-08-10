import { ethers } from "hardhat";

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
  const [owner] = await ethers.getSigners();

  const marketAccount = process.env.MARKETPLACE_ACCOUNT;
  const nftAccount = process.env.NFT_ACCOUNT;

  if (!marketAccount || !nftAccount) return;

  const nftMarketplaceContract = await ethers.getContractAt(
    "NftMarketplace",
    marketAccount
  );
  const basicNftContract = await ethers.getContractAt("Nft", nftAccount);

  console.log(`Minting NFT for ${owner.address}`);
  const mintTx = await basicNftContract.connect(owner).mintNft();
  const mintTxReceipt = await mintTx.wait(1);

  if (mintTxReceipt.events && mintTxReceipt.events[0].args) {
    const tokenId = mintTxReceipt.events[0]?.args.tokenId;

    console.log("Approving Marketplace as operator of NFT...");
    const approvalTx = await basicNftContract
      .connect(owner)
      .approve(nftMarketplaceContract.address, tokenId);
    await approvalTx.wait(1);

    console.log("Listing NFT...");
    const tx = await nftMarketplaceContract
      .connect(owner)
      .listItem(basicNftContract.address, tokenId, PRICE);
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
