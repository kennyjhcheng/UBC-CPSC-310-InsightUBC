import React from 'react';
import QueryHistoricAverage from "./QueryHistoricAverage/QueryHistoricAverage";
import RoomQuery from "./QueryHistoricAverage/RoomQuery";
import {Divider} from "@mui/material";

function App() {
  return (
    <div className="App">
      <header className="App-header">
		  <QueryHistoricAverage></QueryHistoricAverage>
          <Divider />
          <RoomQuery></RoomQuery>
      </header>
    </div>
  );
}

export default App;
