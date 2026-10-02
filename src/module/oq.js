import { OQ } from './consts/consts.js';
import { log } from './utils/logger.js';
import { oqGame } from './utils/oq-game.js';
import { preloadTemplates } from './init/preload-templates.js';
import { registerCustomHookHandlers } from './init/custom-hook-handlers.js';
import { registerDataModels } from './init/register-data-models.js';
import { registerDocuments } from './init/register-documents.js';
import { registerHelpers } from './init/handlebar-helpers.js';
import { registerSettings, registerLateSettings } from './init/register-settings.js';
import { buildMoneyService } from './utils/money.js';
import '../styles/oq.less';

async function init() {
  log('Initializing OQ');
  CONFIG.OQ = OQ;
  game.oq = oqGame;

  registerDataModels();
  registerDocuments();

  registerHelpers();
  registerCustomHookHandlers();
  registerSettings();

  await preloadTemplates();

  game.oq.moneyService = buildMoneyService();

  log('Initialized');
}

async function ready() {
  log('Ready');
  registerLateSettings();
}

async function setup() {
  log('Setup');
}

Hooks.once('init', init);

// Setup system
Hooks.once('setup', setup);

// When ready
Hooks.once('ready', ready);
