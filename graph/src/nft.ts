import { Transfer, Transfer__Params } from "../generated/Nft/Nft";
import { Token, User } from "../generated/schema";
import { Address, log, store } from "@graphprotocol/graph-ts";

const EMPTY_ADDRESS = Address.fromHexString(
  "0x0000000000000000000000000000000000000000"
);

export function handleTransfer(event: Transfer): void {
  const eventParams = event.params;

  if (eventParams.from.equals(EMPTY_ADDRESS)) {
    handleTokenMint(eventParams);
  } else if (eventParams.to.notEqual(EMPTY_ADDRESS)) {
    store.remove("Token", event.params.tokenId.toString());
  } else {
    handleTokenTransfer(eventParams);
  }
}

function handleTokenMint(eventParams: Transfer__Params): void {
  const token = new Token(eventParams.tokenId.toString());

  const ownerAddress = eventParams.to.toHexString();

  token.owner = token.ownerId = ownerAddress;

  token.save();
  ensureUserExists(ownerAddress);
}

function handleTokenTransfer(eventParams: Transfer__Params): void {
  const token = Token.load(eventParams.tokenId.toString());

  if (!token) return;

  const ownerAddress = eventParams.to.toHexString();

  token.owner = token.ownerId = ownerAddress;

  token.save();
  ensureUserExists(ownerAddress);
}

function ensureUserExists(userId: string): void {
  let user = User.load(userId);

  if (!user) {
    user = new User(userId);
  }

  user.save();
}
