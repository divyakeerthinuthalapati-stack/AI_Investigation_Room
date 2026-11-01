import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Fingerprint, RotateCcw, X } from 'lucide-react';
import { Header, Footer } from '../components/Layout.jsx';
import { Button, Eyebrow, NotFound } from '../components/Primitives.jsx';
import { api } from '../services/api.js';

export default function ResultsPage() {
  const { investigationId } = useParams(); const navigate = useNavigate(); const [result, setResult] = useState(null); const [caseData, setCaseData] = useState(null); const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    async function load() {
      let saved;
      try { saved = JSON.parse(sessionStorage.getItem(`result:${investigationId}`) || 'null'); } catch { saved = null; }
      try {
        if (!saved) {
          const token = sessionStorage.getItem(`session:${investigationId}`);
          if (!token) throw new Error('Results are not available in this browser session.');
          const state = await api(`/investigations/${investigationId}`, { token });
          if (state.status !== 'completed' || !state.result) throw new Error('This investigation has no submitted accusation.');
          saved = { ...state.result, suspectId: state.accusation?.suspectId, caseId: state.caseId };
          sessionStorage.setItem(`result:${investigationId}`, JSON.stringify(saved));
        }
        const record = await api(`/cases/${saved.caseId}`);
        if (!alive) return;
        setResult(saved);
        setCaseData(record);
      } catch {
        if (alive) setError(true);
      }
    }
    load();
    return () => { alive = false; };
  }, [investigationId]);
  async function replay() { if (!result) return; try { const next = await api(`/cases/${result.caseId}/investigations`, { method: 'POST' }); sessionStorage.setItem(`mystery:${result.caseId}`, JSON.stringify(next)); navigate(`/case/${result.caseId}`); } catch { navigate('/create'); } }
  if (error) return <div className="page-shell"><Header minimal /><NotFound title="The results are not available." message="The solution is held in this browser session. Return to your case and submit an accusation to reveal it." /></div>;
  if (!result) return null;
  const solution = result.solution; const accused = caseData?.suspects?.find((s) => s.id === result.suspectId);
  return <div className="page-shell"><Header /><main className="results-page"><div className="results-kicker"><span>INVESTIGATION CLOSED</span><span>FILE / {String(result.caseId).slice(-6).toUpperCase()}</span></div><section className={`verdict-hero ${result.correct ? 'correct' : 'incorrect'}`}><div className="verdict-icon">{result.correct ? <Check size={25} /> : <X size={25} />}</div><Eyebrow>{result.correct ? 'A CASE WELL READ' : 'THE EVIDENCE HAD ANOTHER STORY'}</Eyebrow><h1>{result.correct ? 'You found the truth.' : 'A different hand held the key.'}</h1><p>{result.correct ? `Your accusation of ${solution.culpritName} was correct.` : `${accused?.name ?? 'Your suspect'} was not responsible. The evidence points elsewhere.`}</p></section><div className="solution-layout"><section className="solution-main"><div className="solution-section"><Eyebrow>THE CULPRIT</Eyebrow><h2>{solution.culpritName}</h2><div className="culprit-summary"><Fingerprint size={18} /><span>{solution.motive}</span></div><h3>What happened</h3><p>{solution.explanation}</p><p>{solution.method}</p></div><div className="solution-section"><Eyebrow>HOW THE EVIDENCE CONNECTS</Eyebrow><div className="reasoning-list">{solution.reasoning?.map((item, i) => <div key={i}><span>0{i + 1}</span><p>{item}</p></div>)}</div></div>{solution.misleadingClues?.length > 0 && <div className="solution-section"><Eyebrow>THE DISTRACTIONS</Eyebrow><div className="reasoning-list">{solution.misleadingClues.map((item, i) => <div key={i}><span>↗</span><p>{item}</p></div>)}</div></div>}</section><aside className="solution-aside"><div className="answer-file"><div className="answer-file-head">CASE SOLUTION <Check size={14} /></div><span className="answer-label">CANONICAL CULPRIT</span><h3>{solution.culpritName}</h3><span className="answer-label">YOUR ACCUSATION</span><p>{accused?.name ?? 'Unknown suspect'} {result.correct ? '— correct' : '— incorrect'}</p><div className="answer-divider"/><span className="answer-label">SUPPORTING EVIDENCE</span><ul>{(solution.supportingEvidenceIds ?? []).map((id) => <li key={id}><Check size={13} />{caseData?.evidence?.find((e) => e.id === id)?.title ?? id}</li>)}</ul></div><div className="final-timeline"><span>FINAL TIMELINE</span>{solution.timeline?.map((entry, i) => <div key={i}><b>{entry.time}</b><p>{entry.event}</p></div>)}</div></aside></div><div className="results-actions"><Link className="quiet-link" to="/create"><ArrowLeft size={14} /> Create another case</Link><Button onClick={replay}><RotateCcw size={14} /> Replay investigation</Button></div></main><Footer /></div>;
}
