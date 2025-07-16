// Test pour créer un tournoi
const testTournament = {
  name: "Test Tournament",
  city: "Test City",
  start_date: new Date("2025-08-01"),
  end_date: new Date("2025-08-01")
};

fetch('http://localhost:3000/tournaments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testTournament)
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
