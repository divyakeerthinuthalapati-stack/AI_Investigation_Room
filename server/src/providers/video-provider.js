export function videoFallback(evidence) {
  const content = evidence.content ?? {};
  return { status: 'simulated', label: 'SIMULATED CCTV — no genuine video generated', cameraId: content.cameraId ?? 'CAM-01', durationSeconds: content.durationSeconds ?? 18, frames: content.frames ?? [{ time: '00:04', description: evidence.description }, { time: '00:12', description: 'The corridor is empty.' }] };
}
