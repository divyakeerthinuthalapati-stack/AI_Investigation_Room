export function imageFallback(evidence) {
  return { status: 'unavailable', label: 'Fictional image description', description: evidence.content?.caption ?? evidence.description, generated: false };
}
