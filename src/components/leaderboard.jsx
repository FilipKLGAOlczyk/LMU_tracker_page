
const Leaderboard = ({ filteredPlayers }) => {


  return (
    <div className="leaderboard">
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Track</th>
                    <th>Class</th>
                    <th>Car</th>
                    <th>Average Five Laps Time</th>
                </tr>
            </thead>
            <tbody>
                {filteredPlayers.map((player, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{player.name}</td>
                        <td>{player.track}</td>
                        <td>{player.class}</td>
                        <td>{player.car}</td>
                        <td>{player.avg_five}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default Leaderboard;
