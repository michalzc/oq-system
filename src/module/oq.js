import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';

Hooks.once('init', async () => {
  console.log('OQ | Initializing OQ');
  registerSettings();
  await preloadTemplates();
});

// Setup system
Hooks.once('setup', async () => {});

// When ready
Hooks.once('ready', async () => {});
