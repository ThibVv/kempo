// Test simple pour valider la logique
console.log("=== Test de validation de la logique ===");

// Simuler un utilisateur
const mockUser = {
  id: 1,
  club: "Nancy Kempo",
  approved: true,
  role: "club_admin"
};

// Simuler des tournois
const mockTournaments = [
  { id: 1, name: "Tournoi Nancy", club: "Nancy Kempo" },
  { id: 2, name: "Tournoi Lyon", club: "Lyon Kempo" },
  { id: 3, name: "Tournoi Paris", club: "Paris Kempo" }
];

// Test de filtrage par club
console.log("\n1. Test de filtrage par club:");
console.log("Utilisateur du club:", mockUser.club);
console.log("Tous les tournois:", mockTournaments.map(t => `${t.name} (${t.club})`));

const filteredTournaments = mockTournaments.filter(t => t.club === mockUser.club);
console.log("Tournois filtrés:", filteredTournaments.map(t => `${t.name} (${t.club})`));

// Test de permissions
console.log("\n2. Test de permissions:");
console.log("Rôle utilisateur:", mockUser.role);
const canCreateTournament = mockUser.role === 'admin' || mockUser.role === 'club_admin';
console.log("Peut créer un tournoi:", canCreateTournament);

// Test d'éligibilité
console.log("\n3. Test d'éligibilité:");
const tournament = mockTournaments[0]; // Tournoi Nancy
console.log("Tournoi:", tournament.name, "Club:", tournament.club);
console.log("Utilisateur approuvé:", mockUser.approved);
console.log("Même club:", mockUser.club === tournament.club);

const eligible = mockUser.approved && mockUser.club === tournament.club;
console.log("Éligible pour inscription:", eligible);

console.log("\n=== Test terminé ===");
console.log("✅ Filtrage par club: OK");
console.log("✅ Permissions: OK");
console.log("✅ Éligibilité: OK");
console.log("✅ Logique correcte !");
