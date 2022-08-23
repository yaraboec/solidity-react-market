import { main1 } from "./utils";

main1("NftMarketplace", "MARKETPLACE_ACCOUNT")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
