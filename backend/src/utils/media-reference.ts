import { MediaModel } from "../models/media.model";
import type { MediaFolder } from "../models/media.model";
import { HttpError } from "./httpError";

type ImageInput = {
  mediaId?: string;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  altText?: string;
  alt?: string;
  sortOrder?: number;
};

export async function resolveMediaImage(input: ImageInput, expectedFolder?: MediaFolder) {
  if (!input.mediaId) {
    if (!input.url) throw new HttpError(400, "Image must include a mediaId or URL");
    return input;
  }

  const media = await MediaModel.findById(input.mediaId).lean().exec();
  if (!media) throw new HttpError(400, "Referenced media was not found");
  if (expectedFolder && media.folder !== expectedFolder) throw new HttpError(400, "Referenced media is not valid for this catalogue resource");

  return {
    mediaId: media._id.toString(),
    url: media.secureUrl,
    secureUrl: media.secureUrl,
    publicId: media.publicId,
    width: media.width,
    height: media.height,
    format: media.format,
    altText: input.altText ?? media.altText,
    alt: input.alt ?? input.altText ?? media.altText,
    ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
  };
}

export async function resolveMediaImages<T extends ImageInput>(images: T[], expectedFolder?: MediaFolder) {
  return Promise.all(images.map((image) => resolveMediaImage(image, expectedFolder)));
}
