import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Support.css';

const Support = () => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const supportCategories = [
        {
            id: 'technical',
            title: 'Problèmes techniques',
            icon: '🔧',
            description: 'Bugs, erreurs, problèmes de connexion',
            commonIssues: [
                'Problème de connexion au site',
                'Erreur lors de l\'inscription à un tournoi',
                'Affichage incorrect des résultats',
                'Problème avec le scoreboard'
            ]
        },
        {
            id: 'account',
            title: 'Gestion de compte',
            icon: '👤',
            description: 'Profil, mot de passe, informations personnelles',
            commonIssues: [
                'Mot de passe oublié',
                'Modification des informations personnelles',
                'Problème de droits d\'accès',
                'Changement de club'
            ]
        },
        {
            id: 'tournament',
            title: 'Tournois',
            icon: '🏆',
            description: 'Inscription, création, gestion des tournois',
            commonIssues: [
                'Impossible de s\'inscrire à un tournoi',
                'Erreur lors de la création d\'un tournoi',
                'Modification des détails d\'un tournoi',
                'Problème avec les catégories'
            ]
        },
        {
            id: 'general',
            title: 'Question générale',
            icon: '❓',
            description: 'Utilisation du site, fonctionnalités',
            commonIssues: [
                'Comment utiliser le système?',
                'Explication des fonctionnalités',
                'Demande de formation',
                'Suggestion d\'amélioration'
            ]
        }
    ];

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const openJiraPortal = () => {
        // Remplacez cette URL par votre portail de support
        window.open('https://kempo-tournois.atlassian.net/servicedesk/customer/portal/1', '_blank');
    };

    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Centre de Support</h1>
                <p>Besoin d'aide ? Nous sommes là pour vous accompagner.</p>
            </div>

            {/* Informations utilisateur */}
            <div className="user-info-card">
                <div className="user-details">
                    <h3>Vos informations</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Nom:</span>
                            <span className="info-value">{user?.firstName} {user?.lastName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Club:</span>
                            <span className="info-value">{user?.club || 'Non défini'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Rôle:</span>
                            <span className="info-value">
                                {user?.role === 'admin' ? 'Administrateur' : 
                                 user?.role === 'club_admin' ? 'Admin Club' : 'Utilisateur'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catégories de support */}
            <div className="support-categories">
                <h2>Sélectionnez votre type de demande</h2>
                <div className="categories-grid">
                    {supportCategories.map(category => (
                        <div 
                            key={category.id}
                            className={`category-card ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect(category)}
                        >
                            <div className="category-icon">{category.icon}</div>
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Détails de la catégorie sélectionnée */}
            {selectedCategory && (
                <div className="category-details">
                    <h3>Problèmes fréquents - {selectedCategory.title}</h3>
                    <div className="common-issues">
                        {selectedCategory.commonIssues.map((issue, index) => (
                            <div key={index} className="issue-item">
                                <span className="issue-bullet">•</span>
                                <span>{issue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQ rapide */}
            <div className="faq-section">
                <h2>Questions fréquentes</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h4>Comment créer un tournoi ?</h4>
                        <p>Accédez à la section "Liste des tournois" et cliquez sur "Créer un tournoi". Remplissez les informations requises.</p>
                    </div>
                    <div className="faq-item">
                        <h4>Comment s'inscrire à un tournoi ?</h4>
                        <p>Trouvez le tournoi dans la liste et cliquez sur "S'inscrire". Vous devez être connecté pour vous inscrire.</p>
                    </div>
                    <div className="faq-item">
                        <h4>Comment modifier mon profil ?</h4>
                        <p>Allez dans "Mon Profil" depuis le menu de navigation pour modifier vos informations personnelles.</p>
                    </div>
                    <div className="faq-item">
                        <h4>Qui peut créer des tournois ?</h4>
                        <p>Seuls les administrateurs de club et les super administrateurs peuvent créer des tournois.</p>
                    </div>
                </div>
            </div>

            {/* Bouton d'accès au portail Jira */}
            <div className="jira-portal-section">
                <h2>Besoin d'aide supplémentaire ?</h2>
                <p>Si vous ne trouvez pas la réponse à votre question, créez un ticket de support.</p>
                <button 
                    className="jira-portal-button"
                    onClick={openJiraPortal}
                >
                    <span className="button-icon">🎫</span>
                    Créer un ticket de support
                </button>
                <p className="jira-info">
                    Vous serez redirigé vers notre portail de support sécurisé où vous pourrez décrire votre problème en détail.
                </p>
            </div>

            {/* Guide d'utilisation */}
            <div className="usage-guide">
                <h2>Guide d'utilisation rapide</h2>
                <div className="guide-steps">
                    <div className="step">
                        <span className="step-number">1</span>
                        <div className="step-content">
                            <h4>Identifiez votre problème</h4>
                            <p>Sélectionnez la catégorie qui correspond le mieux à votre demande ci-dessus.</p>
                        </div>
                    </div>
                    <div className="step">
                        <span className="step-number">2</span>
                        <div className="step-content">
                            <h4>Consultez les solutions rapides</h4>
                            <p>Vérifiez si votre problème figure dans la liste des problèmes fréquents.</p>
                        </div>
                    </div>
                    <div className="step">
                        <span className="step-number">3</span>
                        <div className="step-content">
                            <h4>Créez un ticket si nécessaire</h4>
                            <p>Si vous ne trouvez pas de solution, utilisez le bouton "Créer un ticket de support".</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
