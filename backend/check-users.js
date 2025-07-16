import mysql from 'mysql2/promise';

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'kempo_db'
        });

        console.log('Connexion à la base de données réussie!');
        
        const [users] = await connection.execute('SELECT id, email, firstName, lastName, role, club, approved FROM user');
        
        console.log('Utilisateurs dans la base de données:');
        users.forEach(user => {
            console.log({
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
                club: user.club,
                approved: user.approved
            });
        });
        
        await connection.end();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

checkUsers();
