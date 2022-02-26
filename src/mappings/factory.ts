

import { ArtistCreated} from "../../generated/Factory/Factory";
  
import {
    Artist as ArtistItem
} from "../../generated/schema";
  
import {
    Artist as ArtistTemplates
} from "../../generated/templates"

  


export function handleNewArtist(event: ArtistCreated): void {
    let artistItem = new ArtistItem(event.params.artist.toHexString());
    artistItem.createdAt = event.block.timestamp;
    artistItem.uri = event.params.uri;
    ArtistTemplates.create(event.params.artist);
    artistItem.save();
  }
  