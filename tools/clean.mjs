import { rm } from 'node:fs/promises';

const pathsToRemove = ['dist', 'build'];

await Promise.all(pathsToRemove.map((path) => rm(path, { recursive: true, force: true })));
