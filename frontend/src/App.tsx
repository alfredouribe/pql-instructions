import React, { useState } from 'react';
import logo from './logo.svg';

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotionPlayer } from './components/NotionPlayer';

//importo mis componentes previamente creados

function App() {
  return (
    //importo browserrouter con su alias router
    <NotionPlayer></NotionPlayer>
  );
}

export default App;
