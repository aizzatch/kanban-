import React from 'react';
import './LandingPage.css';
import { MagicBento } from './components/MagicBento';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="saas-landing">
      <header className="saas-header">
        <a href="#" className="saas-logo">KanbanFlow</a>
        <nav className="saas-nav">
          <a href="#features" className="saas-nav-link">Features</a>
          <a href="#pricing" className="saas-nav-link">Pricing</a>
          <a href="#about" className="saas-nav-link">About</a>
        </nav>
      </header>

      <main>
        <section className="saas-hero">
          <h1>Organize your work effortlessly</h1>
          <p>
            Streamline your workflow with calm and clarity. A modern workspace designed to
            keep your team focused on what matters most.
          </p>
          <button onClick={onStart} className="saas-btn-primary">
            Start for free
          </button>
        </section>

        <section id="features" className="saas-feature">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={8}
            glowColor="120, 120, 120"
          />
        </section>
      </main>
    </div>
  );
};
