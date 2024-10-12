import React, { useState } from 'react';
import logo from './logo.svg';

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//importo mis componentes previamente creados
import TeamCreation from './components/TeamCreation';
import Player from './components/Player';

function App() {
  const [players, setPlayers] = useState([
    {id: 1, name: 'Harry Potter', age: 20, position: 'Seeker'}
  ])

  const removePlayer = (playerId:number) => {
    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId))
  }

  return (
    //importo browserrouter con su alias router
    <Router>
      <div className='App'>
        <h1>Team Management</h1>
        <Routes>
          <Route path='/' element={<TeamCreation/>} />
          {/* <Route path="/players" element={<Player players={players} onRemove={removePlayer} teamId={1} />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
