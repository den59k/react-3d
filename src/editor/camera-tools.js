import { add, multiply } from 'mathjs'
import { mul } from './calc'
import { rotate, translate } from './calc/matrices'

export function rotateCamera (cameraState, delta) {

	const rotation = [...cameraState.get('rotation')]
	rotation[0] -= delta[1] * 0.08
	rotation[1] -= delta[0] * 0.1

	return normalizeCamera(cameraState.merge({ rotation }))
	
}

export function translateCamera (cameraState, delta){

	const vector = mul(delta, rotate(cameraState.get('rotation')))
	
	const position = cameraState.get('position').map((val, index) => val + vector[index])

	return cameraState.merge({position})

}

export function translateTarget (cameraState, delta){
	
	if(cameraState.get('mode') !== 'orbit') return cameraState

	const sens = cameraState.get('distance') / 1700

	const vector = mul([-delta[0] * sens, delta[1] * sens, 0], rotate(cameraState.get('rotation')))
	const target = mul(cameraState.get('target'), translate(vector))

	return normalizeCamera(cameraState.set('target', target.slice(0, 3)))
}

export function setTarget (cameraState, point){

	return normalizeCamera(cameraState.set('target', point))
}

export function normalizeCamera (cameraState){

	const rotation = cameraState.get('rotation')

	if(cameraState.get('mode') === 'orbit'){
		const distance = cameraState.get('distance')
		const _forwardVector = mul([ 0, 0, -distance ], rotate(rotation))
		const position = add(cameraState.get('target'), _forwardVector.slice(0, 3))
		return cameraState.merge({ rotation, position })
	}

	return cameraState
}

export function setCameraMode (cameraState, mode){

	const newState = cameraState.set('mode', mode)
	if(mode === 'orbit' && cameraState.get('mode') === 'fps'){
		const forwardVector = mul([ 0, 0, cameraState.get('distance') ], rotate(cameraState.get('rotation')))
		const target = add (cameraState.get('position'), forwardVector.slice(0, 3))
		return newState.set('target', target)
	}

	return newState
}

const minDistance = 15

export function changeCameraDistance (cameraState, distance){
	if(cameraState.get('mode') !== 'orbit') return cameraState
	
	const currentDistance = cameraState.get('distance') 

	return normalizeCamera(cameraState.set('distance', currentDistance + distance * (currentDistance-minDistance) / 10))
}