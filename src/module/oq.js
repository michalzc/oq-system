import { registerSettings } from './init/register-settings.js';
import { preloadTemplates } from './init/preload-templates.js';
import { log } from './utils.js';
import { OQ } from './consts/consts.js';
import { registerDocuments } from './init/register-documents.js';
import { registerDataModels } from './init/register-data-models.js';
import { registerHelpers } from './init/handlebar-helpers.js';
import { registerCustomHookHandlers } from './init/custom-hook-handlers.js';

async function init() {
  log('Initializing OQ');
  CONFIG.OQ = OQ;

  registerDataModels();
  registerDocuments();
  registerSettings();
  registerHelpers();
  registerCustomHookHandlers();

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
