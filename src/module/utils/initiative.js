/** The actor sheet and declaration tracker use the same rollable actions. */
export function getInitiativeItems(actor) {
  return actor?.items.filter((item) => ['skill', 'specialAbility'].includes(item.type) && item.system.formula) ?? [];
}

export function getInitiativeOptions(actor) {
  return Object.fromEntries(
    getInitiativeItems(actor).map((item) => {
      const value = item.getRollValues()?.value;
      return [item.id, value == null ? item.name : `${item.name} (${value})`];
    }),
  );
}

/** Read prepared roll values, never a dice roll or the skill's roll modifier. */
export function getDeclaration(actor) {
  const { reference = '', mod = 0 } = actor?.system.attributes?.initiative ?? {};
  const item = getInitiativeItems(actor).find((item) => item.id === reference);
  const value = item?.getRollValues()?.value ?? 0;
  return { reference: item?.id ?? '', name: item?.name ?? '', mod: actor ? mod : 0, total: actor ? value + mod : 0 };
}
