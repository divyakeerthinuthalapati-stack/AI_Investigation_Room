import { AlertTriangle, ArrowRight, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Eyebrow({ children }) { return <div className="eyebrow"><span />{children}</div>; }
export function Button({ children, variant = 'primary', className = '', ...props }) { return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>; }
export function Loading({ label = 'Loading case file' }) { return <div className="loading-state"><LoaderCircle className="spin" size={23} /><span>{label}</span></div>; }
export function ErrorPanel({ message, action, onAction }) { return <div className="error-panel"><AlertTriangle size={20} /><div><strong>Something interrupted the investigation.</strong><p>{message}</p>{action && <button className="text-button" onClick={onAction}>{action} <ArrowRight size={14} /></button>}</div></div>; }
export function NotFound({ title = 'This case file is missing.', message = 'It may have expired or the address may be incorrect.' }) { return <main className="center-page"><Eyebrow>FILE NOT FOUND</Eyebrow><h1>{title}</h1><p>{message}</p><Link className="button button-primary" to="/">Return to the room <ArrowRight size={15} /></Link></main>; }
