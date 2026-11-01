import { Link } from 'react-router-dom';
import { ArrowUpRight, Fingerprint } from 'lucide-react';

export function Brand({ light = false }) { return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark"><Fingerprint size={18} strokeWidth={1.7} /></span><span>THE MYSTERY ROOM<span className="brand-sub">INDEPENDENT INVESTIGATIONS</span></span></Link>; }
export function Header({ minimal = false }) { return <header className="site-header"><Brand /><div className="header-right">{!minimal && <span className="header-note"><i className="live-dot" /> ALL CASES ARE FICTIONAL</span>}<Link className="header-link" to="/create">{minimal ? 'BACK TO CASES' : 'START A CASE'} <ArrowUpRight size={15} /></Link></div></header>; }
export function Footer() { return <footer className="site-footer"><span>THE MYSTERY ROOM <span className="muted">© 2026</span></span><span>Every case is fictional. Every clue has a reason.</span><Link to="/create">Open a new case ↗</Link></footer>; }
