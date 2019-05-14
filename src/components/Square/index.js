import React, { Component } from 'react'
import './style.css'
// import Square from '../Square'

export default class Square extends Component {

	render(){
		
		const { color, x, y, type, isBlack, isSelected, onSelectSquare} = this.props
		let className = 'square'
		if (isBlack) className += ' black'
		if (isSelected) {
			console.log('is selected')
			className += ' isSelected'
		}
		return(
			<div 
				onClick={onSelectSquare.bind(this, x, y)} 
				className={className}>
				<div className="squareInner">
					{type &&
						 <img className="piece" src={`images/${color}/${type}.png`}/>
					}
				</div>
			</div>
		)
	}
}

// <img src={`/images${piece.color}/${piece.type}`}