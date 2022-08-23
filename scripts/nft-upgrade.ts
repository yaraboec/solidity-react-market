import { main1 } from "./utils";

main1(process.env.NFT_ACCOUNT ?? "", "Nft")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
