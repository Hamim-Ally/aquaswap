import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Sparkles } from 'lucide-react';

  export default function Footer({ onOpenESGCertificate, onOpenHowItWorks, onOpenSignIn, onOpenSignUp }) {
    return (
              <footer className="site-footer">
                <div className="footer-container">
                  {/* Top Section: Brand + Navigation Columns */}
                  <div className="footer-grid">
                    {/* Column 1: Brand & Regional Network Mission */}
                    <div className="footer-col-brand">
                      <Link to="/" className="footer-brand-link">
                        <div className="footer-brand-logo">
                          <Droplets size={17} color="#0284c7" />
                        </div>
                        <span className="footer-brand-title">AquaSwap</span>
                      </Link>
                      <p className="footer-brand-desc">
                        Algorithmic bilateral water exchange and industrial circular economy infrastructure for Bangladesh's manufacturing clusters.
                      </p>
                      <div className="footer-status-badge">
                        <span className="status-dot-pulse" />
                        <span>Dhaka-Gazipur Grid: <strong>Active</strong></span>
                      </div>
                    </div>

                    {/* Column 2: Core Platform Systems */}
                    <div className="footer-col">
                      <h4 className="footer-col-heading">Marketplace</h4>
                      <ul className="footer-links-list">
                        <li>
                          <Link to="/optimizer">Exchange Network</Link>
                        </li>
                        <li>
                          <Link to="/blender">Multi-Factory Blender</Link>
                        </li>
                        <li>
                          <Link to="/fleet">Live Fleet Dispatch</Link>
                        </li>
                        <li>
                          <Link to="/fleet">B2B Matchmaker</Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Governance & Compliance */}
                    <div className="footer-col">
                      <h4 className="footer-col-heading">Governance & ESG</h4>
                      <ul className="footer-links-list">
                        <li>
                          <Link to="/compliance">Water Purchase Agreement</Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={onOpenESGCertificate}
                            className="footer-link-btn"
                          >
                            ESG Impact Certificate
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={onOpenHowItWorks}
                            className="footer-link-btn"
                          >
                            System Guide
                          </button>
                        </li>
                        <li>
                          <Link to="/compliance">Safety Verification</Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 4: Factory Operations & Switcher */}
                    <div className="footer-col">
                      <h4 className="footer-col-heading">Factory Portal</h4>
                      <ul className="footer-links-list">
                        <li>
                          <button
                            type="button"
                            onClick={() => onOpenSignIn && onOpenSignIn('demo')}
                            className="footer-link-btn highlight"
                          >
                            <Sparkles size={12} color="#0284c7" />
                            <span>Switch Plant (16 Demo)</span>
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => onOpenSignIn && onOpenSignIn('signin')}
                            className="footer-link-btn"
                          >
                            Factory Sign In
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => onOpenSignUp && onOpenSignUp()}
                            className="footer-link-btn"
                          >
                            Register New Plant
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                    {/* Bottom Bar: Copyright & Standards */}
                    <div className="footer-bottom-bar">
                      <div className="footer-copyright">
                        © {new Date().getFullYear()} AquaSwap Technologies. Gazipur & Savar Textile Corridors.
                      </div>
                      <div className="footer-legal-badges">
                        <span className="legal-pill">DoE 2023 Compliant</span>
                        <span className="legal-pill">Zero Liquid Discharge (ZLD)</span>
                        <span className="legal-pill">Bilateral Escrow</span>
                      </div>
                    </div>
                  </div>
              </footer>
              );
}
