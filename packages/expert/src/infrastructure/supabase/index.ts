import { createSharedMemoryExpertUnitOfWork } from "../memory";

export function createDefaultExpertUnitOfWork() {
  return createSharedMemoryExpertUnitOfWork();
}

export { createSharedMemoryExpertUnitOfWork, createMemoryExpertUnitOfWork } from "../memory";
