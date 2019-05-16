import React, { Component } from 'react'
import './style.css'
import Square from '../Square'


export default class Board extends Component {

	render(){
		const { onSelectSquare, selected } = this.props
		return(
			<div className="board">
				{this.props.layout.map((row, i) => {
					return(
						<div key={i} className="row">
							{row.map((square, j) => {
								const isBlack = (i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1)
								return(
									<Square 
										x={j}
										y={i}
										key={`${i}${j}`} 
										isAvailable={this.props.available && this.props.available.indexOf(j + ' ' + i) > -1}
										isSelected={selected && (selected.x === j && selected.y === i)} 
										onSelectSquare={onSelectSquare}
										isBlack={isBlack} 
										pieceType={square.type}
										pieceColor={square.color} />
								)
							})}
						</div>
					)
				})}
			</div>
		)
	}
}