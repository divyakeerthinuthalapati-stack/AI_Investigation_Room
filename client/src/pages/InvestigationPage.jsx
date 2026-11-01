import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Clock3, FileSearch, Fingerprint, Image as ImageIcon, ListFilter, MessageSquareText, NotebookPen, ShieldAlert, UserRound, Video } from 'lucide-react';
import { Header } from '../components/Layout.jsx';
import { Button, ErrorPanel, Eyebrow, Loading } from '../components/Primitives.jsx';
import { api, startInvestigationOnce } from '../services/api.js';

const iconFor = (type) => ({ chat: MessageSquareText, image: ImageIcon, video: Video, profile: UserRound, timeline: Clock3, witness: BookOpen, document: FileSearch, forensic: FileSearch })[type] ?? FileSearch;
const labels = { chat: 'MESSAGES', image: 'PHOTOGRAPH', video: 'SURVEILLANCE', witness: 'WITNESS STATEMENT', profile: 'PERSONNEL FILE', timeline: 'ACTIVITY LOG', document: 'DOCUMENT', forensic: 'FORENSIC REPORT' };

function ContentView({ item }) {
  const content = item.content ?? {};
  if (item.type === 'chat') return <div className="chat-thread">{(content.messages ?? []).map((message, i) => <div className={`chat-message ${i % 2 ? 'outgoing' : ''}`} key={`${message.time}-${i}`}><span>{message.sender} <small>{message.time}</small></span><p>{message.text}</p></div>)}</div>;
  if (item.type === 'video') return <div className="simulated-video"><div className="video-screen"><div className="video-cam">{item.asset?.cameraId ?? content.cameraId ?? 'CAM-01'} · FICTIONAL FEED</div><div className="video-frames">{(item.asset?.frames ?? content.frames ?? []).map((frame, i) => <div key={i}><span>{frame.time}</span><p>{frame.description}</p></div>)}</div><div className="video-bottom">SIMULATED CCTV · NO VIDEO WAS GENERATED</div></div><div className="video-timeline"><span>00:00</span><i /><span>{item.asset?.durationSeconds ?? content.durationSeconds ?? 18}s</span></div></div>;
  if (item.type === 'image') return <div className="image-evidence"><div className="image-placeholder"><ImageIcon size={30} /><span>FICTIONAL IMAGE EVIDENCE</span><i>{content.visualDetails ?? item.description}</i></div><p>{content.caption}</p><small>Illustrative description. No generated image asset is attached to this case.</small></div>;
  if (item.type === 'timeline') return <div className="evidence-timeline">{(content.events ?? []).map((event, i) => <div key={i}><span>{event.time}</span><p>{event.event}</p></div>)}</div>;
  if (item.type === 'profile') return <div className="facts-list">{(content.facts ?? []).map((fact, i) => <p key={i}><span>0{i + 1}</span>{fact}</p>)}</div>;
  if (item.type === 'witness') return <blockquote className="witness-quote">“{content.statement}”<small>CONFIDENCE: {content.confidence}</small></blockquote>;
  return <div className="document-content"><div className="document-lines">{(content.fields ?? []).map((field) => <p key={field.label}><span>{field.label}</span><b>{field.value}</b></p>)}</div><p>{content.text ?? item.description}</p></div>;
}

export default function InvestigationPage() {
  const { caseId } = useParams(); const navigate = useNavigate(); const [record, setRecord] = useState(null); const [selectedId, setSelectedId] = useState(''); const [detail, setDetail] = useState(null); const [investigation, setInvestigation] = useState(null); const [opened, setOpened] = useState([]); const [notes, setNotes] = useState(''); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [accuseId, setAccuseId] = useState(''); const [confirm, setConfirm] = useState(false); const [tab, setTab] = useState('evidence');
  const tokenKey = `mystery:${caseId}`;
  const selected = useMemo(() => record?.evidence?.find((item) => item.id === selectedId), [record, selectedId]);

  useEffect(() => { let alive = true;
    async function init() {
      try {
        const data = await api(`/cases/${caseId}`); if (!alive) return; setRecord(data);
        let saved = null; try { saved = JSON.parse(sessionStorage.getItem(tokenKey) || 'null'); } catch { saved = null; }
        if (!saved?.investigationId || !saved?.sessionToken) { saved = await startInvestigationOnce(caseId); sessionStorage.setItem(tokenKey, JSON.stringify(saved)); }
        sessionStorage.setItem(`session:${saved.investigationId}`, saved.sessionToken);
        if (alive) {
          const state = await api(`/investigations/${saved.investigationId}`, { token: saved.sessionToken });
          if (!alive) return;
          if (state.status === 'completed' && state.result) {
            sessionStorage.setItem(`result:${saved.investigationId}`, JSON.stringify({ ...state.result, suspectId: state.accusation?.suspectId, caseId }));
            navigate(`/results/${saved.investigationId}`, { replace: true });
            return;
          }
          setInvestigation(saved);
          setOpened(state.openedEvidenceIds ?? []);
          setNotes((state.notes ?? []).join('\n'));
          setSelectedId(data.evidence?.[0]?.id ?? '');
        }
      } catch (e) { if (alive) setError(e.message); }
    }
    init(); return () => { alive = false; };
  }, [caseId, navigate, tokenKey]);

  useEffect(() => { let alive = true; if (!selectedId || !investigation) return;
    api(`/cases/${caseId}/evidence/${selectedId}`).then((item) => { if (alive) setDetail(item); }).catch((e) => { if (alive) setError(e.message); });
    setOpened((current) => current.includes(selectedId) ? current : [...current, selectedId]);
    api(`/investigations/${investigation.investigationId}`, { method: 'PATCH', token: investigation.sessionToken, body: { openedEvidenceIds: [selectedId] } }).catch(() => {});
    return () => { alive = false; };
  }, [caseId, selectedId, investigation]);

  const saveNotes = useCallback(async () => { if (!investigation) return; setSaving(true); try { await api(`/investigations/${investigation.investigationId}`, { method: 'PATCH', token: investigation.sessionToken, body: { notes: notes.split('\n').filter(Boolean) } }); } catch (e) { setError(e.message); } finally { setSaving(false); } }, [investigation, notes]);

  async function submitAccusation() {
    if (!investigation || !accuseId) return;
    try { const result = await api(`/investigations/${investigation.investigationId}/accusation`, { method: 'POST', token: investigation.sessionToken, body: { suspectId: accuseId } }); sessionStorage.setItem(`result:${investigation.investigationId}`, JSON.stringify({ ...result, suspectId: accuseId, caseId })); navigate(`/results/${investigation.investigationId}`); }
    catch (e) { setError(e.message); setConfirm(false); }
  }

  if (error && !record) return <div className="page-shell"><Header minimal /><div className="centered-wrap"><ErrorPanel message={error} action="Return home" onAction={() => navigate('/')} /></div></div>;
  if (!record || !investigation) return <div className="page-shell"><Header minimal /><Loading label="Opening the investigation room" /></div>;
  const Icon = iconFor(detail?.type ?? selected?.type);
  return <div className="page-shell investigation-shell"><Header minimal /><main className="investigation-page"><div className="case-topbar"><Link to="/create" className="back-link"><ArrowLeft size={14} /> CLOSE CASE</Link><div className="case-top-title"><span>ACTIVE INVESTIGATION</span><b>{record.title}</b></div><span className="case-status"><i /> IN PROGRESS</span></div><div className="case-intro"><div><Eyebrow>{String(record.category ?? 'CASE').replaceAll('_', ' ').toUpperCase()} · {record.difficulty?.toUpperCase()}</Eyebrow><h1>{record.title}</h1><p>{record.summary}</p></div><div className="case-intro-id"><span>CASE FILE</span><b>{String(record._id).slice(-6).toUpperCase()}</b><small>FICTIONAL INVESTIGATION</small></div></div>
  <div className="investigation-layout"><aside className="suspect-column"><div className="column-heading"><span>PERSONS OF INTEREST</span><span>{String(record.suspects.length).padStart(2, '0')}</span></div><div className="suspect-list">{record.suspects.map((suspect, i) => <button className={`suspect-row ${accuseId === suspect.id ? 'suspect-accused' : ''}`} key={suspect.id} onClick={() => { setAccuseId(suspect.id); setTab('suspects'); }}><span className="suspect-avatar">{suspect.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span><span className="suspect-details"><b>{suspect.name}</b><small>{suspect.role}</small></span><span className="suspect-index">0{i + 1}</span></button>)}</div><div className="suspect-focus"><div className="focus-header"><ShieldAlert size={14} /> SELECT TO REVIEW</div>{accuseId && (() => { const suspect = record.suspects.find((s) => s.id === accuseId); return <><h3>{suspect.name}</h3><p>{suspect.background}</p><div><span>POSSIBLE MOTIVE</span>{suspect.motive}</div><div><span>STATED ALIBI</span>{suspect.alibi}</div></>; })()}</div></aside>
  <section className="evidence-column"><div className="workspace-tabs"><button className={tab === 'evidence' ? 'active' : ''} onClick={() => setTab('evidence')}><FileSearch size={15} /> EVIDENCE</button><button className={tab === 'suspects' ? 'active' : ''} onClick={() => setTab('suspects')}><UserRound size={15} /> SUSPECTS</button><button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}><NotebookPen size={15} /> FIELD NOTES</button></div>{tab === 'evidence' && <><div className="evidence-toolbar"><span><ListFilter size={14} /> EVIDENCE FILE <small>{record.evidence.length} ITEMS</small></span><span>OBSERVED FACTS</span></div><div className="evidence-index">{record.evidence.map((item) => { const ItemIcon = iconFor(item.type); return <button key={item.id} className={`evidence-index-row ${selectedId === item.id ? 'active' : ''} ${opened.includes(item.id) ? 'opened' : ''}`} onClick={() => setSelectedId(item.id)}><ItemIcon size={15} /><span><b>{item.title}</b><small>{labels[item.type] ?? item.type.toUpperCase()}</small></span>{opened.includes(item.id) && <Check size={13} className="opened-check" />}<ChevronRight size={14} /></button>; })}</div></>}{tab === 'suspects' && <div className="suspects-mobile-list">{record.suspects.map((suspect) => <article key={suspect.id}><span className="suspect-avatar">{suspect.name[0]}</span><h3>{suspect.name}</h3><small>{suspect.role}</small><p>{suspect.background}</p><b>ALIBI</b><p>{suspect.alibi}</p></article>)}</div>}{tab === 'notes' && <div className="notes-panel"><label className="field-label" htmlFor="notes">YOUR WORKING THEORY</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Record what you noticed. Keep facts and your own theories distinct…" /><p>Notes are private to this investigation session.</p><Button onClick={saveNotes} disabled={saving}>{saving ? 'Saving…' : 'Save field notes'} <Check size={14} /></Button></div>}</section>
  <section className="evidence-detail"><div className="detail-header"><span><Icon size={14} /> {labels[detail?.type] ?? 'EVIDENCE'}</span><span>OBSERVED</span></div>{detail ? <><h2>{detail.title}</h2><p className="detail-description">{detail.description}</p><div className="content-view"><ContentView item={detail} /></div><div className="detail-source"><span>SOURCE</span><b>{detail.source}</b>{detail.occurredAt && <small>{new Date(detail.occurredAt).toLocaleString()}</small>}</div>{detail.relatedSuspectIds?.length > 0 && <div className="related-evidence"><span>RELATED PERSONS</span><div>{detail.relatedSuspectIds.map((id) => record.suspects.find((s) => s.id === id)?.name).filter(Boolean).join(' · ')}</div></div>}</> : <Loading label="Opening evidence" />}<div className="deduction-note"><span>FIELD NOTE</span><p>Separate what the evidence says from what you think it means.</p></div></section></div>
  {error && <div className="inline-error" role="alert">{error}</div>}<div className="accusation-bar"><div><span><Fingerprint size={17} /> READY TO MAKE YOUR CALL?</span><small>One final accusation. The evidence stays here after you decide.</small></div><Button onClick={() => { if (!accuseId) { setTab('suspects'); setError('Select a suspect on the left before making an accusation.'); return; } setConfirm(true); }}>Make an accusation <ArrowRight size={15} /></Button></div>
  </main>{confirm && <div className="modal-scrim" role="presentation" onClick={() => setConfirm(false)}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}><span className="modal-kicker">FINAL ACCUSATION</span><h2 id="confirm-title">Accuse {record.suspects.find((s) => s.id === accuseId)?.name}?</h2><p>This is your one final accusation for this investigation. The case solution will be revealed after submission.</p><div><button className="button button-outline" onClick={() => setConfirm(false)}>Keep investigating</button><Button onClick={submitAccusation}>Submit accusation <ArrowRight size={14} /></Button></div></section></div>}</div>;
}
