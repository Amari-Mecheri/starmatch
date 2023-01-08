import { colors, utils} from "./utils/utils";
import { useEffect,useState } from "react";

const useConfig=()=>{
  const [timer,setTimer] = useState(null);
  const [timeLeft,setTimeLeft] = useState(10);
  const [gameInProgress, setGameInProgress] = useState(true);
  const [message, setMessage] = useState("Press start to play!!!");
  const [nbStars,setNbStars] = useState(utils.random(1,9));
  const [padColors, setPadColors] = useState(utils.range(1,9).map(x=>colors.available));
  

  useEffect(()=>{
    const countDown = () =>{
      const timeOut=setTimeout(()=>{
          if((timeLeft-1) === 0){
            setGameInProgress(false);
            setTimeLeft(0);
            setMessage("Game Over!!!");
          } else setTimeLeft(timeLeft-1);
          clearTimeout(timer);
          setTimer(null);
        },1000);
        setTimer(timeOut);
      }

    if(gameInProgress){
      if(!timer) countDown();
    } else if(timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  },[gameInProgress,timer,timeLeft]);

  return [timeLeft,gameInProgress,message,nbStars,padColors,setNbStars,setGameInProgress,setMessage,setPadColors];

}

const useCalculation=()=>{
  const [timeLeft,gameInProgress,message,nbStars,padColors,setNbStars,setGameInProgress,setMessage,setPadColors] = useConfig();

  const setNewStarNumber = (newPadColors) =>{
    var numbersLeft = newPadColors.reduce((arr, color, index) => (color === colors.available && arr.push(index+1), arr), []);
    var randomStars = utils.randomSumIn(numbersLeft,9);
    if(randomStars>0) setNbStars(randomStars);
  }

  const checkCandidates = (padColors) => {
    var newPadColors = [...padColors];
    const sum=newPadColors.reduce((count,color,index)=>count += color === colors.candidate ? index+1 : 0,0);
    if(sum>nbStars)
      newPadColors = newPadColors.map((color) => color === colors.candidate?colors.wrong:color);
    else if(sum===nbStars) {
      newPadColors=newPadColors.map((color) => color === colors.candidate?colors.used:color);
      setNewStarNumber(newPadColors);
    } else {
      var sumWrong = newPadColors.reduce((count,color,index)=>count += (color===colors.wrong)?index+1:0,0);
      if(sumWrong>0 && sumWrong<=nbStars){
        newPadColors = newPadColors.map((color)=>color===colors.wrong?colors.candidate:color);
        newPadColors = checkCandidates(newPadColors);
      }
    }
    return newPadColors;
  }

  const checkNumber = (num) => {
    if(gameInProgress){
      var newPadColors = [...padColors];
      if(newPadColors[num-1]!==colors.used)
      if((newPadColors[num-1]===colors.candidate) || (newPadColors[num-1]===colors.wrong))
        newPadColors[num-1] = colors.available;
      else if(newPadColors.includes(colors.wrong)) newPadColors[num-1] = colors.wrong;      
      else newPadColors[num-1] = colors.candidate;

      newPadColors=checkCandidates(newPadColors);
      if(newPadColors.reduce((sum,color) => sum+= color===colors.used?1:0,0)===9){
        setMessage("You won!!!");
        setGameInProgress(false);
      }
      setPadColors(newPadColors);     
    }
  }
  return [timeLeft,gameInProgress,message,nbStars,padColors,checkNumber]
}

const GameHeader = ()=>(
    <div className="help">
      Pick 1 or more numbers that sum to the number of stars
    </div>  
)

const GameRightPad = (props)=>{
  return (
    <div className="right">
      {utils.range(1,9).map(num=>
          <button key={num} id={num} className="number" onClick={()=>props.onClick(num)}
            style={{backgroundColor: props.padColors[num-1]}}>{num}
          </button>)}
    </div>
  )
}

const GameLeftPad=(props)=>{
  return (
    <>
    {props.gameInProgress?(
          <div className="left">
              {utils.range(1,props.nbStars).map(starId=><div key={starId} className="star" />)}
          </div>
      ):(
        <PlayAgain onClick={props.reloadGame} message={props.message}/>
      )}
    </>
  );
}

const PlayAgain = (props) =>{
  return (
    <div className="left">
      <div className="game-done">
        <div className="message">{props.message}</div>
        <button onClick={props.onClick}>Start Game...</button>
      </div>
        
    </div>   
  )
}

const Board = (props) =>{
  return (
    <div className="game">
      {props.header}
      <div className="body">
        {props.left}       
        {props.right}
      </div>
      {props.footer}
    </div>   
  );
}

const StarMatch = (props) => {
 const [timeLeft,gameInProgress,message,nbStars,padColors,checkNumber]=useCalculation();
  return (
    <Board  header = {<GameHeader/>}
            left = {<GameLeftPad gameInProgress={gameInProgress}
                              nbStars={nbStars}
                              message={message}
                              reloadGame={props.reloadGame}/>}
            right = {<GameRightPad padColors={padColors} onClick={checkNumber}/>}
            footer = {<div className="timer" style={{color: timeLeft<4?'red':''}}>Time Remaining: {timeLeft}</div>}
    /> 
  );
};

export default StarMatch;
