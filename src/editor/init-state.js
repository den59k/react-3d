import { Set, Map, OrderedMap, List } from 'immutable'
import { addPoint, connect } from './tools'

export function createSceneState () {
	let sceneState = new Map({
		points: new OrderedMap(),		//points - это Map, у которого в качестве ключа - случайное число
		lines: new Map(),						//lines - содержит линии, у которых в качестве ключа - их своместный хэш
		selected: new Set(),				//selected - ключи точек, которых мы выделили
		selectionArea: null,		//area - отображаемая область выделения на кавасе
		mode: 'cursor',
		gizmoDirection: null		//Когда мы перемещаем что-то у нас остается только одна ось видмима
	})
	sceneState = addPoint(sceneState, [ 0, 0, 0 ])

	return sceneState
}

export function createCameraState () {
	return new Map ({
		position: [ 0, 10, -50 ],
		rotation: [ 0, 0, 0 ],
		fov: 1,
		target: [ 0, 0, 0 ],
		distance: 3
	})
}

export function createHistoryState (initState){
	return new Map({
		nowStep: 0,
		history: new List([initState])
	})
}