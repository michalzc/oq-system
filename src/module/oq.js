import { registerSettings } from './init/settings.js';
import { preloadTemplates } from './init/preloadTemplates.js';
import { log } from './utils.js';
import { OQ } from './consts/consts.js';
import { registerDocuments } from './init/registerDocuments.js';
import { registerDataModels } from './init/registerDataModels.js';

async function init() {
  log('Initializing OQ');
  CONFIG.OQ = OQ;

  registerDataModels();
  registerDocuments();
  registerSettings();
  await preloadTemplates();

  log('Initialized');
}

async function ready() {
  log('Ready');
}

async function setup() {
  log('Setup');
}

Hooks.once('init', init);

// Setup system
Hooks.once('setup', ready);

// When ready
Hooks.once('ready', setup);
