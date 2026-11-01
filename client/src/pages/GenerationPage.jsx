import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Fingerprint } from 'lucide-react';
import { Header } from '../components/Layout.jsx';
import { ErrorPanel, Eyebrow, Loading } from '../components/Primitives.jsx';
import { api } from '../services/api.js';

const stages = ['Establishing the case facts', 'Preparing the evidence', 'Checking references and consistency', 'Case ready'];

export default function GenerationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [errorAction, setErrorAction] = useState('Try another premise');
  const [retrySignal, setRetrySignal] = useState(0);

  useEffect(() => {
    let alive = true;
    let timer;
    let connectionFailures = 0;

    const poll = async () => {
      try {
        const next = await api(`/cases/jobs/${jobId}`);
        if (!alive) return;
        connectionFailures = 0;
        setError('');
        setJob(next);

        if (next.status === 'ready' && next.caseId) {
          navigate(`/case/${next.caseId}`, { replace: true });
          return;
        }
        if (next.status === 'failed') {
          setError(next.message || 'The case could not be completed.');
          setErrorAction('Try another premise');
          return;
        }
        timer = setTimeout(poll, 1600);
      } catch (cause) {
        if (!alive) return;
        connectionFailures += 1;
        setErrorAction('Retry connection');
        if (connectionFailures >= 5) {
          setError(`${cause.message} Status checks stopped after several attempts.`);
          return;
        }
        setError(`${cause.message} Retrying (${connectionFailures}/5)…`);
        timer = setTimeout(poll, 3500);
      }
    };

    setError('');
    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [jobId, navigate, retrySignal]);

  const active = stages.findIndex((stage) => stage === job?.stage);
  const progress = job?.progress ?? 0;

  return (
    <div className="page-shell">
      <Header minimal />
      <main className="generation-page">
        <Link to="/create" className="back-link"><ArrowLeft size={14} /> BACK TO CASE BUILDER</Link>
        <div className="generation-content">
          <div className="generation-seal"><Fingerprint size={34} strokeWidth={1.2} /></div>
          <Eyebrow>CASE ASSEMBLY IN PROGRESS</Eyebrow>
          <h1>Putting the pieces<br />in <em>place.</em></h1>
          <p className="generation-intro">A mystery is only as good as the evidence that holds it together. We’re checking the details before the file opens.</p>
          {error ? (
            <ErrorPanel
              message={error}
              action={errorAction}
              onAction={() => {
                if (errorAction === 'Retry connection') {
                  setError('');
                  setRetrySignal((value) => value + 1);
                } else {
                  navigate('/create');
                }
              }}
            />
          ) : (
            <>
              <div className="progress-wrap">
                <div className="progress-label"><span>{job?.stage || 'Starting the case file'}</span><span>{progress}%</span></div>
                <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="generation-stages">
                {stages.map((stage, index) => (
                  <div className={`generation-stage ${index < active ? 'done' : ''} ${index === active ? 'current' : ''}`} key={stage}>
                    <span>{index < active ? <Check size={12} /> : `0${index + 1}`}</span>{stage}
                  </div>
                ))}
              </div>
              <Loading label="Building and checking the evidence" />
            </>
          )}
          <p className="generation-disclaimer">Progress reflects completed stages. Generation time can vary.</p>
        </div>
      </main>
      <div className="generation-footer">THE MYSTERY ROOM <span>·</span> EVERY CASE IS FICTIONAL</div>
    </div>
  );
}
