import { add, multiply } from 'mathjs'
import { mul } from './calc'
import { rotate } from './calc/matrices'

export function rotateCamera (cameraState, delta) {

	const rotation = [...cameraState.get('rotation')]
	rotation[0] -= delta[1] * 0.08
	rotation[1] -= delta[0] * 0.1

	return cameraState.merge({rotation})
	
}

export function translateCamera (cameraState, delta){

	const vector = mul(delta, rotate(cameraState.get('rotation')))
	
	const position = cameraState.get('position').map((val, index) => val + vector[index])

	return cameraState.merge({position})

}