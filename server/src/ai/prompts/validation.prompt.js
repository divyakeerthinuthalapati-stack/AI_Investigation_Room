export function validationPrompt(blueprint, evidence) {
  return `Review this fictional mystery package for contradictions in timeline, suspect details, and clue references; identify missing support, accidental culprit reveals, or an ambiguous answer. Do not change any facts. Return JSON only as {valid:boolean,issues:string[]}. A playable case requires one supported culprit, resolvable references, and evidence that permits deduction.\nBLUEPRINT: ${JSON.stringify(blueprint)}\nEVIDENCE: ${JSON.stringify(evidence)}`;
}
