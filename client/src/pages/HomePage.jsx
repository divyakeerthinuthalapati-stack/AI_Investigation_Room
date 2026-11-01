import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, FileText, Fingerprint, Image, MessageSquareText, ScanSearch, ShieldCheck } from 'lucide-react';
import { Brand, Footer, Header } from '../components/Layout.jsx';
import { Eyebrow } from '../components/Primitives.jsx';

const evidenceCards = [
  { icon: MessageSquareText, type: '01 / COMMUNICATION', title: 'Messages leave traces', body: 'Read the exchange. Notice what changed, and when.' },
  { icon: ScanSearch, type: '02 / THE WITNESS', title: 'Memory has edges', body: 'A confident statement still has to match the record.' },
  { icon: Image, type: '03 / THE SCENE', title: 'Look closer', body: 'Photographs and logs make a room give up its secrets.' },
];

export default function HomePage() {
  return <div className="page-shell"><Header /><main>
    <section className="hero"><div className="hero-copy"><Eyebrow>A NEW CASE IS WAITING</Eyebrow><h1>Every clue<br />has a <em>story.</em></h1><p className="hero-lede">Step into a world built from evidence. Follow the details, question the alibis, and decide who is telling the truth.</p><div className="hero-actions"><Link className="button button-primary" to="/create">Create a mystery <ArrowRight size={16} /></Link><a className="quiet-link" href="#how-it-works">How it works <ArrowDown size={14} /></a></div><div className="hero-footnote"><ShieldCheck size={14} /> FICTIONAL CASES. ORIGINAL EVIDENCE. YOUR CALL.</div></div>
      <div className="hero-art" aria-label="A fictional case file on an investigator's desk"><div className="art-topline"><span>CASE FILE / 001</span><span className="status-tag"><i /> OPEN</span></div><div className="art-photo"><div className="photo-stamp">ARCHIVE<br />NO. 08—41</div><div className="photo-horizon" /><div className="photo-lamp" /><div className="photo-caption">WEST GALLERY · 21:14</div></div><div className="art-file"><div className="file-head"><span>THE EMPTY FRAME</span><span>ASHCOMBE / 18 OCT</span></div><div className="file-body"><div className="file-line line-long" /><div className="file-line line-short" /></div><div className="file-clue"><span className="clue-dot" /><span>Something was moved.<br /><b>The question is who had the key.</b></span><ArrowUpRight size={15} /></div></div><div className="art-index">FIELD NOTE <span>04:17 PM</span><div>“The room was locked.<br />The frame was not.”</div></div><div className="art-crosshair">+</div></div>
      <div className="hero-side-note">EST. IN THE DETAILS <span>↘</span></div>
    </section>
    <section className="manifesto" id="how-it-works"><div className="section-label"><span>THE INVESTIGATION</span><span>01 — 03</span></div><div className="manifesto-grid"><h2>Not a story you watch.<br /><em>A case you work.</em></h2><div className="manifesto-copy"><p>Each mystery begins with a premise and becomes a complete investigation: people with reasons, records with gaps, and a truth waiting to be found.</p><Link to="/create" className="inline-link">Build your case <ArrowRight size={15} /></Link></div></div><div className="evidence-cards">{evidenceCards.map(({ icon: Icon, type, title, body }, i) => <article className="evidence-card" key={type}><div className="card-meta"><span>{type}</span><span>0{i + 1}</span></div><div className="card-icon"><Icon size={20} strokeWidth={1.5} /></div><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="closing-cta"><div className="cta-mark"><Fingerprint size={25} strokeWidth={1.3} /></div><div><Eyebrow>THE FILE IS OPEN</Eyebrow><h2>What do you make<br />of the evidence?</h2></div><Link className="button button-cream" to="/create">Open an investigation <ArrowRight size={16} /></Link><span className="cta-number">ROOM / 001</span></section>
  </main><Footer /></div>;
}
