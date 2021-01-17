import { Map } from 'immutable'
import { mul } from './index'

const count = 6
const gridSize = 40

export default function getGrid (matrix){
	
	const lines = []
	for(let i = -Math.floor(count/2); i <= Math.floor(count/2); i++){
		const p = ([
			mul([ gridSize * i / count, 0, -gridSize/2 ], matrix),
			mul([ gridSize * i / count, 0, gridSize/2 ], matrix)
		])
		if(p[0] !== null && p[1] !== null) lines.push(p)
	}

	for(let i = -Math.floor(count/2); i <= Math.floor(count/2); i++){
		const p = ([
			mul([ -gridSize/2, 0, gridSize * i / count ], matrix),
			mul([ gridSize/2, 0, gridSize * i / count ], matrix)
		])
		if(p[0] !== null && p[1] !== null) lines.push(p)
	}

	return lines
		
}