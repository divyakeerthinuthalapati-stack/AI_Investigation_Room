import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CreateCasePage from './pages/CreateCasePage.jsx';
import GenerationPage from './pages/GenerationPage.jsx';
import InvestigationPage from './pages/InvestigationPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/create" element={<CreateCasePage />} /><Route path="/generation/:jobId" element={<GenerationPage />} /><Route path="/case/:caseId" element={<InvestigationPage />} /><Route path="/results/:investigationId" element={<ResultsPage />} /><Route path="*" element={<NotFoundPage />} /></Routes>;
}
