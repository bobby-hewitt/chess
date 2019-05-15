import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './components/Board'

import data from './data/setup'

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      layout: data,
      selected: null,
      turn: 'white',
      available: [],
      canCastle: {
        black: {
          queen: true,
          king: true
        },
        white: {
          queen: true,
          king: true,
        }
      }
    }
  }
  //helpers
  isValidCoord(layout, coords){
   
    return layout[coords.y] && layout[coords.y][coords.x]
  }

  isOwnPiece(layout, coords){
    
    const { turn } = this.state
    return layout[coords.y][coords.x].color === turn 
  }

  isOpponentPiece(layout, coords){
    
    const { turn } = this.state
    return layout[coords.y][coords.x].color && layout[coords.y][coords.x].color !== turn 
  }

  formatCoord(coords){
    return coords.x + ' ' + coords.y
  }

  checkObsruction(layout, coord, callback){
    // this function takes a callback which adds cordinate to possible moves
    // a FALSE return should break the loop
    if (this.isValidCoord(layout, coord)){
      if (this.isOwnPiece(layout, coord)){
        return false
      } else if(this.isOpponentPiece(layout, coord)){
        callback(this.formatCoord(coord))
        return false
      } else {
        callback(this.formatCoord(coord))
        return true
      }
    } else {
      // console.log('FOUND INVALID COORD, should optimise')
    }
  }

  //player action
  onSelectSquare(x,y){
    const { selected, layout, turn, available } = this.state  
    if (selected){
      if (available.indexOf(this.formatCoord({x,y})) > -1){
        this.takeMove(layout[selected.y][selected.x], x,y)
      } else {
        this.setState({selected: null, available:[]})
      }
      return
    }
    //check piece is correct color
    const selectedSquare = layout[y][x].color === turn ? {x, y} : null
    if (selectedSquare){
      this.checkAvailableMoves(layout, selectedSquare).then((available) => {
        this.setState({selected: selectedSquare, available})
      })
    }
    // this.setState({selected: state})
  }

  checkAvailableMoves(layout, selected){
    return new Promise((resolve, reject) => {
      const piece = layout[selected.y][selected.x]
      var available = []
      switch(piece.type){
        case 'knight':
          available = this.knightAvailable(layout, selected)
          break
        case 'pawn':
          available = this.pawnAvailable(layout, selected, piece.color)
          break
        case 'rook':
          available = this.straightAvailable(layout, selected)
          break
        case 'bishop':
          available = this.diagonalAvailable(layout, selected)
          break
        case 'queen':
          console.log('looking for queenueen', selected)
          available = this.diagonalAvailable(layout, selected).concat(this.straightAvailable(layout, selected))
          break
        case 'king':
          available = this.kingAvailable(layout, selected)
          break
        default:
          return
      }
      console.log(piece, available)
      resolve(available)
    })  
  }

  diagonalAvailable(layout, selected){ 
      const { x, y } = selected 
      var availableCoords = []
      function addCoord(coord){
        availableCoords.push(coord)
      }  
      for (let i = x + 1; i < 8; i++){
          if(!this.checkObsruction(layout, {x:i, y: y + (i -x) },addCoord)) break
      }
      for (let i = x + 1; i < 8; i++){
         if(!this.checkObsruction(layout, {x:i, y: y - (i -x) },addCoord)) break
      }
      for (let i = x - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:i, y: y - (i -x) },addCoord)) break
      }
      for (let i = x - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:i, y: y + (i -x) },addCoord)) break
      }
      return availableCoords
  }



  straightAvailable(layout, selected){ 
      const { x, y } = selected 

      var availableCoords = []

      function addCoord(coord){
        availableCoords.push(coord)
      }
      
      for (let i = x + 1; i < 8; i++){
          if(!this.checkObsruction(layout, {x:i, y: y },addCoord)) break
      }
      for (let i = x - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:i, y: y},addCoord)) break
      }
      for (let i = y + 1; i < 8; i++){
         if(!this.checkObsruction(layout, {x:x, y: i},addCoord)) break
      }
      for (let i = y - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:x, y: i },addCoord)) break
      }
      return availableCoords
  }

  knightAvailable(layout, selected){
    const { x, y } = selected 
    var availableCoords = []

    function addCoord(coord){
      availableCoords.push(coord)
    }   
    //all possible moves of a knight
    var allDirs = [
      {x: x-1, y: y+2},
      {x: x-1, y: y-2},
      {x: x-2, y: y-1},
      {x: x-2, y: y+1},
      {x: x+1, y: y+2},
      {x: x+1, y: y-2},
      {x: x+2, y: y-1},
      {x: x+2, y: y+1},
    ]
    //find available moves considering position and state of the board
    for (var i = 0; i < allDirs.length; i++){
      this.checkObsruction(layout, allDirs[i],addCoord)
    }
    return availableCoords
  }

  kingAvailable(selected){ 
    const { x, y } = selected 
      var availableCoords = []
      
      function addCoord(coord){
        availableCoords.push(coord)
      }

      const allDirs = [
        {x: x-1, y: y-1},
        {x: x-1, y: y},
        {x: x-1, y: y+1},
        {x: x, y: y+1},
        {x: x, y: y-1},
        {x: x+1, y: y-1},
        {x: x+1, y: y},
        {x: x+1, y: y+1},
      ]

      for (var i = 0; i < allDirs.length; i++){
        this.checkObsruction(allDirs[i],addCoord)
      }
      return availableCoords
  }

  pawnAvailable(layout, selected, color, checkingCheck){
    const { x, y } = selected
    const dir = color === 'white' ? -1 : +1
    const oppositeColor = color === 'white' ? 'black' : 'white'
    
    let availableCoords = []

    if (!checkingCheck && layout[y + dir] && !layout[y + dir][x].color){
      availableCoords.push(this.formatCoord({x:x, y: y + dir}))  
      //handles first go
      if (((color === 'white' && y === 6) || (color === 'black' && y ===1)) && !layout[y + (dir * 2)][x].color){
        
        availableCoords.push(this.formatCoord({x:x, y: y + (dir * 2)}))
      } 
    }
    //logic for diagonal taking
    if (layout[y + dir] && layout[y + dir][x-1] && layout[y + dir][x-1].color === oppositeColor){
      availableCoords.push(this.formatCoord({x:x-1, y: y + dir}))
    }
    if (layout[y + dir] && layout[y + dir][x+1] && layout[y + dir][x+1].color === oppositeColor){
      availableCoords.push(this.formatCoord({x:x+1, y: y + dir}))
    }
    //TODO 
    // Handle upgrading of pawn if it reaches the highest rank
    //handle En passant
    return availableCoords
  }


  takeMove(piece, x, y){
      const { selected, turn } = this.state
      const newLayout = Object.assign([], this.state.layout);
      newLayout[selected.y][selected.x] = {};
      newLayout[y][x] = piece;
      const nextTurn = turn === 'white' ? 'black' : 'white'
      this.checkCheck(newLayout, turn, nextTurn).then((isCheck) => {
        if (!isCheck){
          
       
        this.setState({layout: newLayout, selected: null, turn: nextTurn, available: []})          
        }
      })
      
  }

  findKing(layout, color){
    for (var i = 0; i < layout.length; i++){
        for (var j = 0; j < layout[i].length; j++){
          if (layout[i][j] && layout[i][j].color === color && layout[i][j].type === 'king'){
              return this.formatCoord({y: i, x: j})
          }
        }
      }
  }

  checkCheck(layout, turn, nextTurn){
    
    return new Promise((resolve, reject) => {
      var isCheck = false
      let kingPos = this.findKing(layout, turn)
      let pieces = this.findOpponenetPieces(layout, nextTurn)
      let promises = []
      for (var i = 0; i < pieces.length; i++){
        promises.push(this.checkAvailableMoves(layout, pieces[i]))
      }
      Promise.all(promises).then((results) => {
        console.log(results)
        var availableMoves = []
        for(var i = 0; i < results.length; i++){
          availableMoves = availableMoves.concat(results[i])
        }
        isCheck = availableMoves.indexOf(kingPos) > -1
        console.log(kingPos, availableMoves)
        resolve(isCheck)
      })

      
      
    })
    
  }

  findOpponenetPieces(layout, nextTurn){
    console.log(layout)
      
      var opponentPieces = []
      for (var i = 0; i < layout.length; i++){
        for (var j = 0; j < layout[i].length; j++){
          if (layout[i][j] && layout[i][j].color === nextTurn){
            opponentPieces.push({y:i, x:j})
          }
        }
      }
      return opponentPieces
  }



  render(){
    const { selected, available } = this.state; 
    return (
      <div className="App">
        <Board 
          layout={data}
          selected={selected}
          available={available}
          onSelectSquare={this.onSelectSquare.bind(this)}/>    
      </div>
    );
  }
}

export default App;
