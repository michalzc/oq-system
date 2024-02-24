import { registerSettings } from './init/register-settings.js';
import { preloadTemplates } from './init/preload-templates.js';
import { OQ } from './consts/consts.js';
import { registerDocuments } from './init/register-documents.js';
import { registerDataModels } from './init/register-data-models.js';
import { registerHelpers } from './init/handlebar-helpers.js';
import { registerCustomHookHandlers } from './init/custom-hook-handlers.js';
import { oqGame } from './utils/oq-game.js';
import { log } from './utils/logger.js';

async function init() {
  log('Initializing OQ');
  CONFIG.OQ = OQ;
  game.oq = oqGame;

  registerDataModels();
  registerDocuments();

  registerHelpers();
  registerCustomHookHandlers();

  await preloadTemplates();

  log('Initialized');
}

async function ready() {
  log('Ready');
  registerSettings();
}

async function setup() {
  log('Setup');
}

Hooks.once('init', init);

// Setup system
Hooks.once('setup', ready);

// When ready
Hooks.once('ready', setup);
