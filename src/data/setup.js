function createRow(backrow, color){
	return(
		[
			{
				color:color,
				type: backrow ? 'rook' : 'pawn',
			},	
			{
				color:color,
				type: backrow ? 'knight' : 'pawn'
			},	
			{
				color:color,
				type: backrow ? 'bishop' : 'pawn'
			},	
			// {},{},
			{
				color:color,
				type: backrow ? 'king' : 'pawn'
			},
			{
				color:color,
				type: backrow ? 'king' : 'pawn'
			},	
			{
				color:color,
				type: backrow ? 'bishop' : 'pawn'
			},	
			{
				color:color,
				type: backrow ? 'knight' : 'pawn'
			},	
				
			// {},{},{},
			{
				color:color,
				type: backrow ? 'rook' : 'pawn'
			}
		]
	)
}



const data = [
	createRow(true, 'black'),
	createRow(false, 'black'),
	[{},{},{},{},{},{},{},{}],
	[{color:'white', type:'queen'},{},{},{},{},{},{},{}],
	[{},{},{},{},{},{},{},{}],
	[{},{},{},{},{},{},{},{}],
	// [{},{},{},{},{},{},{},{}],
	[{},{},{},{},{},{},{},{}],
	// createRow(false, 'white'),
	createRow(true, 'white'),
]

export default data