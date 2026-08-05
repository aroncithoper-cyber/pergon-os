import type { CmsUnitOfWork } from "./ports";
import {
  createPreviewToken,
  drainHomeSchedule,
  getHomeDocument,
  getPreviewHome,
  getPublishedHome,
  listHomeVersions,
  publishHome,
  rollbackHome,
  saveHomeDraft,
  scheduleHome,
} from "./use-cases/home";
import {
  createMediaAsset,
  deleteMediaAsset,
  getMediaAsset,
  listMediaAssets,
  toggleMediaFavorite,
  updateMediaAsset,
} from "./use-cases/media";

export function createCmsServices(uow: CmsUnitOfWork) {
  return {
    getHomeDocument: (input: unknown) => getHomeDocument(uow, input),
    saveHomeDraft: (input: unknown) => saveHomeDraft(uow, input),
    publishHome: (input: unknown) => publishHome(uow, input),
    scheduleHome: (input: unknown) => scheduleHome(uow, input),
    createPreviewToken: (input: unknown) => createPreviewToken(uow, input),
    getPreviewHome: (token: string) => getPreviewHome(uow, token),
    getPublishedHome: (input: unknown) => getPublishedHome(uow, input),
    listHomeVersions: (input: unknown) => listHomeVersions(uow, input),
    rollbackHome: (input: unknown) => rollbackHome(uow, input),
    drainHomeSchedule: (actorId?: string) => drainHomeSchedule(uow, actorId),
    listMediaAssets: (input: unknown) => listMediaAssets(uow, input),
    getMediaAsset: (input: unknown) => getMediaAsset(uow, input),
    createMediaAsset: (input: unknown) => createMediaAsset(uow, input),
    updateMediaAsset: (input: unknown) => updateMediaAsset(uow, input),
    deleteMediaAsset: (input: unknown) => deleteMediaAsset(uow, input),
    toggleMediaFavorite: (input: unknown) => toggleMediaFavorite(uow, input),
  };
}

export type CmsServices = ReturnType<typeof createCmsServices>;

export * from "./ports";
export {
  createPreviewToken,
  drainHomeSchedule,
  ensureHomeDocument,
  getHomeDocument,
  getPreviewHome,
  getPublishedHome,
  listHomeVersions,
  publishHome,
  rollbackHome,
  saveHomeDraft,
  scheduleHome,
} from "./use-cases/home";
export {
  createMediaAsset,
  deleteMediaAsset,
  getMediaAsset,
  listMediaAssets,
  toggleMediaFavorite,
  updateMediaAsset,
} from "./use-cases/media";
