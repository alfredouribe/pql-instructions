import React from "react";
import Player from "./Player";

const TeamCreation: React.FC = () => {
    //agrego jugadores de prueba
    const [players, setPlayers] = React.useState([
        {id: 1, name: 'Harry Potter', age: 18, position: 'Seeker'},
        {id: 2, name: 'Hermione Granger', age: 18, position: 'Chaser'},
        {id: 3, name: 'Ron Weasley', age: 18, position: 'Beater'},
    ])

    const handleRemove = (playerId: number) => {
        setPlayers(players.filter((player) => player.id !== playerId))
    }

    return(
        <div>
            <h1>Create new team</h1>

            <Player players={players} onRemove={handleRemove} teamId={1} />
        </div>
    )
}

export default TeamCreation;