import {
  SaleAdded,
  SaleRemoved,
  TokenPurchased,
} from "../generated/NftMarketplace/NftMarketplace";
import { Sale, Token } from "./../generated/schema";
import { store } from "@graphprotocol/graph-ts";

export function handleSaleAdd(event: SaleAdded): void {
  const eventParams = event.params;

  const token = Token.load(eventParams.tokenId.toString());

  if (!token) return;

  const tokenSale = new Sale(eventParams.tokenId.toString());

  tokenSale.contractId = eventParams.nftAddress.toHexString();
  tokenSale.price = eventParams.price;

  tokenSale.token = eventParams.tokenId.toString();

  tokenSale.save();
}

export function handleSaleRemove(event: SaleRemoved): void {
  store.remove("Sale", event.params.tokenId.toString());
}

export function handleSalePurchase(event: TokenPurchased): void {
  store.remove("Sale", event.params.tokenId.toString());
}
