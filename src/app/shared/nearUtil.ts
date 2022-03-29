import { environment } from 'src/environments/environment';

const NFT_SERIES_MIRROR_CRYSTALS_MAINNET = '49585';
const NFT_SERIES_MIRROR_CRYSTALS_TESTNET = '494';

export function getMirrorCrystalSeries() {
  return environment.production
    ? NFT_SERIES_MIRROR_CRYSTALS_MAINNET
    : NFT_SERIES_MIRROR_CRYSTALS_TESTNET;
}
