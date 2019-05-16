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
      computerColor: 'black',
      playerColor: 'white',
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

  isOwnPiece(layout, coords, turn){
    return layout[coords.y][coords.x].color === turn 
  }

  isOpponentPiece(layout, coords, turn){
    return layout[coords.y][coords.x].color && layout[coords.y][coords.x].color !== turn 
  }

  formatCoord(coords){
    return coords.x + ' ' + coords.y
  }
  getCoordsFromString(string){
    const xy = string.split(' ')
    const x = parseInt(xy[0])
    const y = parseInt(xy[1])
    return {x, y}

  }

  checkObsruction(layout, coord, callback, turn){
    // this function takes a callback which adds cordinate to possible moves
    // a FALSE return should break the loop
    if (this.isValidCoord(layout, coord)){
      if (this.isOwnPiece(layout, coord, turn)){
        return false
      } else if(this.isOpponentPiece(layout, coord, turn)){
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
    const { selected, layout, turn, available, computerColor } = this.state  
    
      if (selected){
        if (available.indexOf(this.formatCoord({x,y})) > -1){
          this.takeMove(layout[selected.y][selected.x], x,y)
        } else {
          this.setState({selected: null, available:[]})
        }
        return
      }
      //check piece is correct color
      const selectedSquare = (layout[y][x].color === turn && layout[y][x].color !== computerColor) ? {x, y} : null
      if (selectedSquare){
        this.checkAvailableMoves(layout, selectedSquare).then((piece) => {
          this.setState({selected: selectedSquare, available: piece.availableMoves})
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
          this.knightAvailable(layout, selected).then((result) => {
            const info = {piece: piece, position:selected, availableMoves: result}
            resolve(info)
          }) 
          break
        case 'pawn':
          this.pawnAvailable(layout, selected, piece.color).then((result) => {
            const info = {piece: piece, position:selected, availableMoves: result}
            resolve(info)
          })
          break
        case 'rook':
          this.straightAvailable(layout, selected).then((result) => {
             const info = {piece: piece, position:selected, availableMoves: result}
             resolve(info)
          })
          break
        case 'bishop':
          this.diagonalAvailable(layout, selected).then((result) => {
            const info = {piece: piece, position:selected, availableMoves: result}
            resolve(info)
          })
          break
        case 'queen': 
          Promise.all([this.diagonalAvailable(layout, selected),this.straightAvailable(layout, selected) ]).then((results) => {
            available = results[0].concat(results[1])
            const info = {piece: piece, position:selected, availableMoves: available}
            resolve(info)
          })
          break
        case 'king':
            this.kingAvailable(layout, selected).then((result) => {
              const info = {piece: piece, position:selected, availableMoves: result}
              resolve(info)
            })
          break
        default:
          return
      }
    })  
  }

  diagonalAvailable(layout, selected){ 
    return new Promise((resolve, reject) => {
        const { x, y } = selected 
        const color = layout[selected.y][selected.x].color
        var availableCoords = []
        

        function addCoord(coord){
          availableCoords.push(coord)
        }  
        
        for (let i = x + 1; i < 8; i++){
            if(!this.checkObsruction(layout, {x:i, y: y + (i -x) },addCoord, color)) break
        }
        for (let i = x + 1; i < 8; i++){
           if(!this.checkObsruction(layout, {x:i, y: y - (i -x) },addCoord, color)) break
        }
        for (let i = x - 1; i > -1; i--){
          if(!this.checkObsruction(layout, {x:i, y: y - (i -x) },addCoord, color)) break
        }
        for (let i = x - 1; i > -1; i--){
          if(!this.checkObsruction(layout, {x:i, y: y + (i -x) },addCoord, color)) break
        }
        resolve(availableCoords)
    })
     
  }



  straightAvailable(layout, selected){
    return new Promise((resolve, reject) => { 
      const { x, y } = selected 
      const color = layout[selected.y][selected.x].color
      var availableCoords = []

      function addCoord(coord){
        availableCoords.push(coord)
      }
      
      for (let i = x + 1; i < 8; i++){
          if(!this.checkObsruction(layout, {x:i, y: y },addCoord, color)) break
      }
      for (let i = x - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:i, y: y},addCoord, color)) break
      }
      for (let i = y + 1; i < 8; i++){
         if(!this.checkObsruction(layout, {x:x, y: i},addCoord, color)) break
      }
      for (let i = y - 1; i > -1; i--){
        if(!this.checkObsruction(layout, {x:x, y: i },addCoord, color)) break
      }
      resolve(availableCoords)
    })
  }

  knightAvailable(layout, selected){
    return new Promise((resolve, reject) => {
      const { x, y } = selected 
      const color = layout[selected.y][selected.x].color
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
        this.checkObsruction(layout, allDirs[i],addCoord, color)
      }
      resolve(availableCoords)
    }) 
  }

  kingAvailable(layout, selected){ 
    return new Promise((resolve, reject) => {
      const { x, y } = selected 
      const color = layout[selected.y][selected.x].color
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
        this.checkObsruction(layout, allDirs[i],addCoord, color)
      }
      resolve(availableCoords)
    })
  }

  pawnAvailable(layout, selected, color, checkingCheck){
    return new Promise((resolve, reject) => {
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
      // return availableCoords
      resolve(availableCoords)
    })
  }

  createUpdatedLayout(layout, selected, moveTo, piece){
    const { x,y } = moveTo
      let newLayout = []
      for (var i = 0; i < this.state.layout.length; i++){
        let row = []
        for (var j = 0; j < this.state.layout[i].length; j++){
          row.push(this.state.layout[i][j])
        }
        newLayout.push(row)
      }
      newLayout[selected.y][selected.x] = {};
      newLayout[y][x] = piece;
      return newLayout
  }



  takeMove(piece, x, y, position){
    console.log(piece, x, y, position)
    const { selected, turn } = this.state
      var newLayout = this.createUpdatedLayout(this.state.layout, selected, {x,y}, piece)
      
      const nextTurn = turn === 'white' ? 'black' : 'white'
      this.checkCheck(newLayout, turn, nextTurn).then((isCheck) => {
        if (!isCheck.isCheck){  
          this.setState({layout: newLayout, selected: null, turn: nextTurn, available: []}, () => {
            if (this.state.turn === this.state.computerColor)this.computerTurn()
          })          
        } else {
          this.setState({layout:  this.state.layout, selected: null, turn: turn, available: []})          

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

  checkCheck(layout, turn, nextTurn, computerMoveIndex){ 
    console.log('checkingCheck')
    return new Promise((resolve, reject) => {
      var isCheck = false
      let kingPos = this.findKing(layout, turn)
      let pieces = this.findAllPiecesOfColor(layout, nextTurn)
      this.findAllMovesForPieces(layout, pieces).then((pieceInfo) => {
        let isCheck = false 
        for (var i = 0 ; i < pieceInfo.length; i++){
          if (pieceInfo[i].move.indexOf(kingPos) > -1) isCheck = true
        }
        resolve({isCheck: isCheck, index: computerMoveIndex})
      })    
    })
  }


  findAllMovesForPieces(layout, pieces){
    let promises = []
    return new Promise((resolve, reject) => {
      for (var i = 0; i < pieces.length; i++){
        promises.push(this.checkAvailableMoves(layout, pieces[i]))
      }
      Promise.all(promises).then((results) => {
        var availableMoves = []
        for(var i = 0; i < results.length; i++){
            for (var j =0; j < results[i].availableMoves.length; j++){
              availableMoves.push({
                piece: results[i].piece, 
                position:results[i].position, 
                move: results[i].availableMoves[j]
              })
            } 
        }
        resolve(availableMoves)
      })
    })
  }


  findAllPiecesOfColor(layout, color){
      var pieces = []
      for (var i = 0; i < layout.length; i++){
        for (var j = 0; j < layout[i].length; j++){
          if (layout[i][j] && layout[i][j].color === color){
            pieces.push({y:i, x:j})
          }
        }
      }
      return pieces
  }






  //computer turn functions
  findValidComputerMoves(){
    return new Promise((resolve, reject) => {
      const { computerColor, playerColor, layout } = this.state 
      const pieces = this.findAllPiecesOfColor(layout, computerColor)
      this.findAllMovesForPieces(layout, pieces).then((moves) => {
          let promises = []
          
          for (var i = 0; i < moves.length; i++){
            const move = moves[i]
            const coords = this.getCoordsFromString(move.move)
            let newLayout = this.createUpdatedLayout(layout, move.position, coords, move.piece)
            promises.push(this.checkCheck.call(this, newLayout, computerColor, playerColor, i))
          }


        
          console.log(moves.length)
          Promise.all(promises).then((data) => {
            for(var i = data.length-1; i >= 0; i--){
              // console.log(i)
              if (data[i].isCheck){
                console.log('isCheck')
                moves.splice(data[i].index, 1)
              }  
            }
            console.log(moves)
            if (moves.length === 0){
              //checkmate or stalemate
              
            } else {
              
              resolve(moves)
            }
          })
        })  
    })
  }

  computerTurn(){
    this.findValidComputerMoves()
    .then((moves) => {
      let moveIndex = Math.floor(Math.random() * moves.length)
      const move = moves[moveIndex]
      this.takeComputerMove(move)
    })
  }

  takeComputerMove(move){
    let coords = this.getCoordsFromString(move.move)
    this.setState({
      selected: move.position
    }, () => {
      this.takeMove(move.piece, coords.x, coords.y, move.position)
    })
  }

  render(){
    const { selected, available, layout } = this.state; 
    return (
      <div className="App">
        <Board 
          layout={layout}
          selected={selected}
          available={available}
          onSelectSquare={this.onSelectSquare.bind(this)}/>    
      </div>
    );
  }
}

export default App;
