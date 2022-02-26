import {
  onURIChanged,
  onArtistURIChanged,
  onSold,
  onPriceChanged,
  onSaleStatusChanged,
  Transfer,
  Artist as ArtistContract,
} from "../../generated/templates/Artist/Artist";



import {

  Artist as ArtistItem,
  NFT as NFTItem,
  Transfer as TransferItem,
} from "../../generated/schema";

import { Address, BigInt } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function handleURIChange(event: onURIChanged): void {
  const nftID = `${event.address.toHex()}-${event.params.tokenId.toString()}`;

  let nftItem = NFTItem.load(nftID)!;
  nftItem.uri = event.params._uri;
  nftItem.save();
}

export function handleSold(event: onSold): void {
  const nftID = `${event.address.toHex()}-${event.params.tokenId.toString()}`;

  let nftItem = NFTItem.load(nftID)!;
  nftItem.isSold = true;
  nftItem.save();
}

export function handleSaleStatus(event: onSaleStatusChanged): void {
  const artistItem = ArtistItem.load(event.address.toHex())!;
  artistItem.saleEnabled = event.params.status;
  artistItem.save();
}

export function handlePriceChange(event: onPriceChanged): void {
  const nftID = `${event.address.toHex()}-${event.params.tokenId.toString()}`;

  let nftItem = NFTItem.load(nftID)!;
  nftItem.price = event.params.price;
  nftItem.save();
}

export function handleURIChanged(event: onArtistURIChanged): void {
  let artistItem = ArtistItem.load(event.address.toHex())!;
  artistItem.uri = event.params._artistUri;
  artistItem.save();
}

export function handeTransfer(event: Transfer): void {
  const trnasferId = `${event.transaction.hash.toHex()}-${event.params.tokenId}`;
  const transferItem = new TransferItem(trnasferId);
  transferItem.createdAt = event.block.timestamp;
  transferItem.from = event.params.from;
  transferItem.to = event.params.to;
  transferItem.hash = event.transaction.hash.toHex();
  transferItem.tokenId = event.params.tokenId;
  transferItem.save();

  const nftID = `${event.address.toHex()}-${event.params.tokenId.toString()}`;

  let nftItem: NFTItem;
  let transfers: string[] = [];
  if (event.params.from.toHex() == ADDRESS_ZERO) {
    nftItem = new NFTItem(nftID);
    nftItem.createdAt = event.block.timestamp;
    nftItem.artist = event.address.toHex();
    nftItem.tokenId = event.params.tokenId;
    const artistItem = ArtistItem.load(event.address.toHexString())!;
    const artist = ArtistContract.bind(event.address);
    const uri = artist.tokenURI(event.params.tokenId);
    let price = artist.try__price(event.params.tokenId);
    if(price.reverted){
      nftItem.price = BigInt.fromString("0");
    }else{
      nftItem.price = price.value
    }
    nftItem.uri = uri;
    const totalSupply = artist.try_totalSupply()
    if(totalSupply.reverted){
      artistItem.totalSupply = 5;
    }else{
      artistItem.totalSupply = totalSupply.value.toI32()
    }
    transfers = [transferItem.id];
    artistItem.save();
  } else {
    nftItem = NFTItem.load(nftID)!;
    transfers = nftItem.transfers!;
    transfers.push(trnasferId);
  }

  if(nftItem){
    nftItem.transfers = transfers;
    nftItem.owner = event.params.to;
    nftItem.save();
  }

}
