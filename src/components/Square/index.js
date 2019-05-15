import React, { Component } from 'react'
import './style.css'
// import Square from '../Square'

export default class Square extends Component {

	render(){
		
		const { color, x, y, type, isBlack, isSelected, onSelectSquare, isAvailable} = this.props
		let className = 'square'
		if (isBlack) className += ' black'
		if (isSelected) {
			console.log('is selected')
			className += ' isSelected'
		}
		if (isAvailable){
			className += ' isAvailable'
		}
		return(
			<div 
				onClick={onSelectSquare.bind(this, x, y)} 
				className={className}>
				<div className="squareInner">
					{isAvailable && 
						<div className="available" />

					}
					{type &&
						 <img className="piece" src={`images/${color}/${type}.png`}/>
					}
				</div>
			</div>
		)
	}
}

// <img src={`/images${piece.color}/${piece.type}`}