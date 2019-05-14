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

  onSelectSquare(x,y){
    const { selected, layout, turn } = this.state  
    if (selected){
      this.checkMove(x,y)
      return
    }
    //check piece is correct color
    const state = 
      layout[y][x].color === turn ? {x, y} : 
      null
      console.log(state)
      this.setState({selected: state})
  }

  checkMove(x,y){
    const { layout, selected, turn } = this.state
    const piece = layout[selected.y][selected.x]
    //if your own piece is at the destination then deselect
    if (layout[y][x].color === turn){
      return this.setState({selected: null})
    }
    //otherwise follow piece specific logic
    switch(piece.type){
      case 'knight':
        this.knight(piece, x,y)
      case 'pawn':
        this.pawn(piece, x,y)
      return
      case 'rook':
        this.rook(piece, x,y)
      case 'bishop':
        this.bishop(piece, x,y)
      case 'queen':
        this.queen(piece, x,y)
      case 'king':
        this.king(piece, x,y)
      default:
      return
    }
  }

  king(piece, x, y){
    const { layout, selected, turn, canCastle } = this.state
    let diffX = x - selected.x 
    if (diffX < 0) diffX *= -1
    let diffY = y - selected.y 
    if (diffY < 0) diffY *= -1

    if (diffX < 2 && diffY < 2 && !(diffX=== 0 && diffY === 0)){
      console.log('can move')
      this.updateCanCastle(turn)
      this.takeMove(piece, x, y)
    } else if (diffX === 2){
      let target = selected.x - x < 0 ? 'queen' : 'king'
      if (canCastle[turn][target]){
        //castletime
        const rookPosition =  {y: selected.y, x: target === 'queen' ? 7 : 0}
        this.checkCastle(piece, selected, {x,y}, target === 'queen' ? 7 : 0)
      }
    }
  }


  queen(piece, x, y){
    console.log('moving queen')
    const { layout, selected } = this.state 
    if (selected.x === x){
      this.checkNoPiecesInWayStraight(piece, selected, {x, y}, 'y')
    } else if ( selected.y === y){
      this.checkNoPiecesInWayStraight(piece, selected, {x, y}, 'x')
    } else {
      let diffX = selected.x - x 
      if (diffX < 0) diffX *= -1
      let diffY = selected.y - y 
      if (diffY < 0) diffY *= -1
      if (diffX === diffY){
        this.checkNoPiecesInWayDiagonal(piece, selected, {x, y})
      } else {
        this.setState({selected: null})
      }

      }
  }
   knight(piece, x,y){
    const { selected } = this.state
    const correct = 
      ((selected.x - x === 2 || selected.x - x === -2) && (selected.y - y === 1 || selected.y - y === -1))||
      ((selected.y - y === 2 || selected.y - y === -2) && (selected.x - x === 1 || selected.x - x === -1))
    if (correct){
      this.takeMove(piece, x, y)
    }
  }

  bishop(piece, x, y){
    const { selected } = this.state
    let diffX = selected.x - x 
    if (diffX < 0) diffX *= -1
    let diffY = selected.y - y 
    if (diffY < 0) diffY *= -1
    if (diffX === diffY){
      this.checkNoPiecesInWayDiagonal(piece, selected, {x, y})
    } else {
      this.setState({selected: null})
    }
  }

  rook(piece, x, y){
    const { selected } = this.state
    if (selected.x === x){
      this.checkNoPiecesInWayStraight(piece, selected, {x, y}, 'y')
    } else if ( selected.y === y){
      this.checkNoPiecesInWayStraight(piece, selected, {x, y}, 'x')
    }
  }

  pawn(piece, x, y){
    const { layout, selected, turn } = this.state
    const dir = piece.color === 'white' ? +1 : -1
    if (
      //going into another color
      (layout[y][x].color && layout[y][x].color !== piece.color) && 
      // 1 to the left or right
      (x === selected.x + 1 || x === selected.x -1) && 
      // 1 ahead
      (y === selected.y + dir) 
    ) {
      this.takeMove(piece, x, y)
      //logic for pawn taking 
      console.log('Pawn is taking another piece')
    } else if (selected.x === x && ((piece.color === 'black' && selected.y === 1 && y === 3 ) || (piece.color === 'white' && selected.y === 6 && y === 4))){
      this.takeMove(piece, x, y)
      //logic for 2
    } else if ((piece.color === 'black' && y === selected.y + 1) || (piece.color === 'white' && y === selected.y - 1)) {
      //logic for one move
      this.takeMove(piece, x, y)
    }
  }


  // is the path clear?
  checkNoPiecesInWayDiagonal(piece, origin, destination){
    const { layout } = this.state;
    const dirX = origin.x - destination.x < 0 ? 1 : -1;
    const dirY = origin.y - destination.y < 0 ? 1 : -1;
    //this is how many spaces to check
    let diff = origin.x - destination.x 
    if (diff < 0){
      diff *= -1
    }
    for (var i = 1; i < diff; i++){
      const testX = (origin.x + dirX * i)
      const testY = (origin.y + dirY * i)
      // console.log('Y', origin.y, (origin.y + dirY * i), 'x', origin.x,(origin.x + dirX * i))
      if (layout[testY][testX].color){
        this.setState({selected: null})
        return
      }
    }
    this.takeMove(piece, destination.x, destination.y)
  }
  checkNoPiecesInWayStraight(piece, origin, destination, axisToCheck ){
    const { layout, turn } = this.state
    let destinationIsGreaterThanOrigin = destination[axisToCheck] - origin[axisToCheck]  > 0 ? true : false
    let startI = destinationIsGreaterThanOrigin ? origin[axisToCheck] : destination[axisToCheck]
    let endI = destinationIsGreaterThanOrigin ? destination[axisToCheck] : origin[axisToCheck] 
      for (var i = startI + 1; i <endI; i++){
        console.log(layout[axisToCheck === 'y' ? i : origin.y][axisToCheck === 'x' ? i : origin.x])
        if (layout[axisToCheck === 'y' ? i : origin.y][axisToCheck === 'x' ? i : origin.x].color){
          this.setState({selected: null})
          return
        } 
      }
      if (piece.type === 'rook'){
        this.updateCanCastle(turn, origin)
      }
      this.takeMove(piece, destination.x, destination.y)
  }



  //special castling functions
  checkCastle(piece, origin, destination, rookPosition){
    const axisToCheck = 'x'
    const { layout, turn } = this.state
    let destinationIsGreaterThanOrigin = destination[axisToCheck] - origin[axisToCheck]  > 0 ? true : false
    let startI = destinationIsGreaterThanOrigin ? origin[axisToCheck] : destination[axisToCheck]
    let endI = destinationIsGreaterThanOrigin ? destination[axisToCheck] : origin[axisToCheck] 
      for (var i = startI + 1; i <endI; i++){
        console.log(layout[axisToCheck === 'y' ? i : origin.y][axisToCheck === 'x' ? i : origin.x])
        if (layout[axisToCheck === 'y' ? i : origin.y][axisToCheck === 'x' ? i : origin.x].color){
          this.setState({selected: null})
          return
        } 
      }
      // if (piece.type === 'rook'){
      //   this.updateCanCastle(turn, origin)
      // }
      this.castle(piece, origin, destination, rookPosition)
      // this.takeMove(piece, destination.x, destination.y)
  }
  updateCanCastle(turn, rookCoords){
    let canCastle = this.state.canCastle
    if (!rookCoords){
      canCastle[turn] = {
        king:false,
        queen: false
      }
    }
    else{
      let target;
      if (rookCoords.x === 7) target = 'queen'
      else target = 'king'
      canCastle[turn][target] = false 
    }
    this.setState({canCastle})
  }

  castle(piece, origin, destination, rookPosition){
    const { turn } = this.state
    const newLayout = Object.assign([], this.state.layout);
    //move king
    newLayout[origin.y][origin.x] = {};
    newLayout[destination.y][destination.x] = piece;
    //move rook
    console.log('rook position', rookPosition, destination)
    newLayout[origin.y][rookPosition] = {};
    let newRookPosition = rookPosition ? 4 : 2;
    newLayout[origin.y][newRookPosition] = {
      type: 'rook',
      color: turn
    }
    this.updateCanCastle(turn)
    const nextTurn = turn === 'white' ? 'black' : 'white'
    this.setState({layout: newLayout, selected: null, turn: nextTurn})
  }
  //global
  takeMove(piece, x, y){
      const { selected, turn } = this.state
      this.checkCheck((moveIsValid) => {
        if (moveIsValid){
          const newLayout = Object.assign([], this.state.layout);
          newLayout[selected.y][selected.x] = {};
          newLayout[y][x] = piece;
          const nextTurn = turn === 'white' ? 'black' : 'white'
          this.setState({layout: newLayout, selected: null, turn: nextTurn})
        } else {
          this.setState({selected: null})
        }
      })     
  }

  findOpponenetPieces(){
    const { turn, layout } = this.state
    console.log(layout)
      var opponentPieces = []
      for (var i = 0; i < layout.length; i++){
        for (var j = 0; j < layout[i].length; j++){
          if (layout[i][j].color && layout[i][j].color !== turn){
            opponentPieces.push()
          }
        }
      }
      return opponentPieces
  }


  checkCheck(callback){
    // const {layout } = this.state
    var pieces = this.findOpponenetPieces()
    for (var i = 0; i < pieces.length; i++){

    }
    callback(true)
    
  }

  render(){
    const { selected } = this.state; 
    return (
      <div className="App">
        <Board 
          layout={data}
          selected={selected}
          onSelectSquare={this.onSelectSquare.bind(this)}/>    
      </div>
    );
  }
}

export default App;
