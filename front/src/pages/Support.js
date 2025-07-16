import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Support.css';

const Support = () => {
  const { user } = useAuth();

  const supportCategories = [
    {
      icon: '🐛',
      title: 'Signaler un bug',
      description: 'Vous avez trouvé un problème technique ou un dysfonctionnement',
      type: 'bug'
    },
    {
      icon: '💡',
      title: 'Demande d\'amélioration',
      description: 'Vous souhaitez proposer une nouvelle fonctionnalité ou amélioration',
      type: 'feature'
    },
    {
      icon: '❓',
      title: 'Question générale',
      description: 'Vous avez une question sur l\'utilisation de l\'application',
      type: 'question'
    },
    {
      icon: '⚙️',
      title: 'Problème technique',
      description: 'Vous rencontrez des difficultés techniques ou de configuration',
      type: 'technical'
    }
  ];

  const handleOpenPortal = () => {
    window.open('https://kempo-tournois.atlassian.net/servicedesk/customer/portal/1', '_blank');
  };

  return (
    <div className="support-container">
      <div className="support-header">
        <h1>Centre d'aide et support</h1>
        <p className="support-subtitle">
          Notre équipe est là pour vous aider. Utilisez notre portail de support pour obtenir une assistance rapide et efficace.
        </p>
      </div>

      <div className="support-content">
        {/* Guide d'utilisation */}
        <div className="support-section">
          <h2>🚀 Comment obtenir de l'aide</h2>
          <div className="support-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Identifiez votre problème</h3>
                <p>Choisissez la catégorie qui correspond le mieux à votre demande ci-dessous</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Accédez au portail</h3>
                <p>Cliquez sur "Ouvrir le portail de support" pour accéder à notre système de tickets</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Créez votre ticket</h3>
                <p>Décrivez votre problème avec le maximum de détails pour un traitement rapide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Catégories de support */}
        <div className="support-section">
          <h2>📋 Types de demandes</h2>
          <div className="support-categories">
            {supportCategories.map((category, index) => (
              <div key={index} className="support-category">
                <div className="category-icon">{category.icon}</div>
                <div className="category-content">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="support-section">
          <h2>👤 Informations pour votre ticket</h2>
          <div className="user-info-card">
            <p><strong>Nom d'utilisateur :</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email :</strong> {user?.email}</p>
            <p><strong>Rôle :</strong> {user?.role}</p>
            <p><strong>Club :</strong> {user?.club || 'Non défini'}</p>
            <div className="info-tip">
              💡 <strong>Conseil :</strong> Ces informations vous seront demandées lors de la création de votre ticket. 
              Préparez également une description détaillée de votre problème.
            </div>
          </div>
        </div>

        {/* Bouton d'action principal */}
        <div className="support-action">
          <button 
            className="support-portal-btn"
            onClick={handleOpenPortal}
          >
            <span className="btn-icon">🎫</span>
            Ouvrir le portail de support
          </button>
          <p className="portal-info">
            Vous serez redirigé vers notre portail de support sécurisé Jira Service Desk
          </p>
        </div>

        {/* FAQ rapide */}
        <div className="support-section">
          <h2>❓ Questions fréquentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Comment réinitialiser mon mot de passe ?</h4>
              <p>Utilisez la fonction "Mot de passe oublié" sur la page de connexion</p>
            </div>
            <div className="faq-item">
              <h4>Qui peut créer des tournois ?</h4>
              <p>Seuls les administrateurs et les administrateurs de club peuvent créer des tournois</p>
            </div>
            <div className="faq-item">
              <h4>Comment s'inscrire à un tournoi ?</h4>
              <p>Cliquez sur "S'inscrire" dans la liste des tournois de votre club</p>
            </div>
            <div className="faq-item">
              <h4>Délai de réponse du support ?</h4>
              <p>Nous répondons généralement dans les 24-48h ouvrées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
