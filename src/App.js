import React from 'react';
import './App.css';
import KiddushLevana from './components/kiddushlevana';
import SideNav from './components/SideNav';

function App() {
  return (
    <div>
      <SideNav innerComponent={<KiddushLevana/>}/>
    </div>
  );
}

export default App;
