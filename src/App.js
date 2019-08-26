import React from 'react';
import './App.css';
import KiddushLevana from './components/kiddushlevana';
import SideNav from './components/SideNav';
import { HDate } from 'hebcal';
import calcMolad from './components/calcMolad.js';

require('hebcal');

	//TODO: double check algorithm
  function isLeapYear(yearAsNumber){
    switch (yearAsNumber % 19) {
      case 0: case 3: case 6: case 8:
      case 11: case 14: case 17: return 1;
      default: return 0
    }
  }

function numMonthsThisYear(year){
  if (isLeapYear(year)) return 13;
  return 12;
}

function App() {
  
  const d = new HDate();
  // const m = new Month(d.month - 1, d.year);
  // console.log(m);
  var transformedForCalc = d.month + 7;
  var transformedYear = d.year;
  if (transformedForCalc > numMonthsThisYear(d.year)){
    transformedForCalc -= numMonthsThisYear(d.year);
    transformedYear += 1;
  }
  console.log(calcMolad(transformedYear, transformedForCalc)); //Hdate numbers with adar as 0, calcmolad numbers tishrei as 0
  console.log(d.month)
  // console.log(calcMolad(d.year, d.month + 0))
  return (
    <div>
      <SideNav innerComponent={<KiddushLevana/>}/>
    </div>
  );
}

export default App;
