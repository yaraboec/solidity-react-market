import { main } from "./utils";

main("NftMarketplace", [])
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
