export const ChatConfig = {
  itemTemplate: 'systems/oq/templates/chat/parts/item-template.hbs',
  adjustmentTemplate: 'systems/oq/templates/chat/parts/adjustment-roll.hbs',

  MessageFlags: {
    scope: 'oq',
    key: 'messageType',
    updateFromChat: 'updateFromChat',
    hasRollDamage: 'hasRollDamage',
  },
  AdjustmentType: {
    mp: 'mp',
    hp: 'hp',
  },
};
