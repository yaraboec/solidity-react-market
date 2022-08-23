import { main } from "./utils";

main("Nft", "NFT_ACCOUNT")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
