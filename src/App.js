import './App.css';
import StarMatch from './star-match'
import { useState } from "react";

const Game= (props) =>{
  const [gameId,setGameId] = useState(1);
  const reloadGame=()=>{setGameId(gameId+1)}
  return (
    <StarMatch key={gameId} reloadGame={reloadGame}/>
  )
}

function App() {
  return (
    <Game />
  );
}

export default App;
