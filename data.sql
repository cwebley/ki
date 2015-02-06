
--get Total for certain player/tournament
SELECT SUM(value) total FROM games g JOIN users u ON u.id = g.winningplayerId JOIN tournaments t ON t.id = g.tournamentId WHERE u.name = 'g' AND t.name='test tourney';

