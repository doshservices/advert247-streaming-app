const CAMPAIGN_CLOUDFRONT_BASE = "https://d1m3tt7ld1wwl8.cloudfront.net/";
const STREAMING_CLOUDFRONT_BASE = "https://du0jby8g769zz.cloudfront.net/";

export const prepareVideoUrl = (isCampaign, key) => {
  const baseUrl = isCampaign
    ? CAMPAIGN_CLOUDFRONT_BASE
    : STREAMING_CLOUDFRONT_BASE;

  return `${baseUrl}${key}/Default/HLS/${key}.m3u8`;
};
