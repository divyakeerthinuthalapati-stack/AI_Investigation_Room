import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { Header, Footer } from '../components/Layout.jsx';
import { Button, Eyebrow } from '../components/Primitives.jsx';
import { api } from '../services/api.js';

const examples = ['A priceless object vanishes from a locked room.', 'A colleague receives a message from someone who disappeared.', 'Someone at a remote retreat knows a secret they should not.'];
const categories = [['murder', 'Murder'], ['theft', 'Theft'], ['missing_person', 'Missing person'], ['corporate_espionage', 'Corporate espionage'], ['blackmail', 'Blackmail'], ['disappearance', 'Disappearance'], ['unexplained', 'Unexplained incident']];
const tones = [['classic_detective', 'Classic detective'], ['realistic', 'Realistic'], ['psychological', 'Psychological'], ['suspenseful', 'Suspenseful']];

export default function CreateCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ scenario: '', category: 'theft', difficulty: 'medium', setting: '', tone: 'classic_detective' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setError('');
    if (form.scenario.trim().length < 30) { setError('Give us at least 30 characters to build a case around.'); return; }
    setBusy(true);
    try { const { jobId } = await api('/cases', { method: 'POST', body: { ...form, scenario: form.scenario.trim() } }); navigate(`/generation/${jobId}`, { replace: true }); }
    catch (cause) { setError(cause.message); setBusy(false); }
  }
  return <div className="page-shell"><Header minimal /><main className="create-layout"><aside className="create-aside"><a href="/" className="back-link"><ArrowLeft size={14} /> BACK TO THE ROOM</a><Eyebrow>NEW INVESTIGATION</Eyebrow><h1>Start with<br />a <em>question.</em></h1><p>Give us the first detail. We’ll build a world of people, evidence, and competing explanations around it.</p><div className="aside-note"><span className="note-icon"><Lightbulb size={16} /></span><span><b>A good premise leaves room to wonder.</b><small>A place, a missing thing, or one detail that does not add up.</small></span></div><div className="aside-count">CASE BUILDER <span>01 / 01</span></div></aside>
    <section className="form-panel"><form onSubmit={submit}><div className="form-section-head"><span>01</span><div><h2>The premise</h2><p>What happened? What feels impossible?</p></div></div><label className="field-label" htmlFor="scenario">CASE PREMISE <span>REQUIRED</span></label><textarea id="scenario" value={form.scenario} maxLength={2000} onChange={(e) => update('scenario', e.target.value)} placeholder="A manuscript disappears from a private library during a storm. The door was locked from the inside, and three people insist they never left their rooms…" required minLength={30} /><div className="field-footer"><span>30–2,000 characters</span><span className={form.scenario.length > 1900 ? 'count-warn' : ''}>{form.scenario.length} / 2,000</span></div><div className="prompt-chips"><span>NEED A START?</span>{examples.map((example) => <button type="button" key={example} onClick={() => update('scenario', example)}>{example}</button>)}</div>
      <div className="form-divider" /><div className="form-section-head"><span>02</span><div><h2>Shape the case</h2><p>Set the kind of story you want to investigate.</p></div></div><label className="field-label">CATEGORY</label><div className="select-grid">{categories.map(([value, label]) => <button type="button" key={value} className={`choice ${form.category === value ? 'selected' : ''}`} onClick={() => update('category', value)}>{label}</button>)}</div><label className="field-label difficulty-label">DIFFICULTY</label><div className="difficulty-row">{[['easy', 'Easy', 'A clear trail'], ['medium', 'Medium', 'A few crossed wires'], ['hard', 'Hard', 'Read between lines']].map(([value, label, sub]) => <button type="button" key={value} className={`difficulty-choice ${form.difficulty === value ? 'selected' : ''}`} onClick={() => update('difficulty', value)}><span className="difficulty-bars"><i /><i className={value !== 'easy' ? 'on' : ''} /><i className={value === 'hard' ? 'on' : ''} /></span><b>{label}</b><small>{sub}</small></button>)}</div>
      <div className="optional-fields"><div><label className="field-label" htmlFor="setting">SETTING <span>OPTIONAL</span></label><input id="setting" value={form.setting} maxLength={100} onChange={(e) => update('setting', e.target.value)} placeholder="A remote coastal hotel" /></div><div><label className="field-label" htmlFor="tone">TONE</label><select id="tone" value={form.tone} onChange={(e) => update('tone', e.target.value)}>{tones.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}<div className="submit-row"><span><b>FICTIONAL CASE</b><small>Generated evidence, one hidden solution.</small></span><Button type="submit" disabled={busy}>{busy ? 'Opening the file…' : 'Build my case'} <ArrowRight size={15} /></Button></div>
    </form></section></main><Footer /></div>;
}
