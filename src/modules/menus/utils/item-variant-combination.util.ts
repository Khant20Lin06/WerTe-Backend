export function buildVariantCombinationSignature(optionIds: string[]): string {
  return [...new Set(optionIds.map((optionId) => optionId.trim()).filter(Boolean))]
    .sort()
    .join('|');
}

export function buildVariantCombinationDefaultName(optionNames: string[]): string {
  return optionNames
    .map((optionName) => optionName.trim())
    .filter(Boolean)
    .join(' / ');
}
