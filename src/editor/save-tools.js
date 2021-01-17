import { Map, OrderedMap, Set } from 'immutable'
import { updateCounter, genKey, makeLine } from './tools'

export function stateToJson (sceneState, cameraState){
	const state = {
		points: sceneState.get('points').toObject(),
		lines: sceneState.get('lines').toObject()
	}
	
	const jsonObject = { sceneState: state, cameraState: cameraState.toObject() }

	return JSON.stringify(jsonObject)
}

export function jsonToState (json){
	const jsonObject = JSON.parse(json)

	const points = Object.keys(jsonObject.sceneState.points).map(key => [parseInt(key), jsonObject.sceneState.points[key]])

	const sceneState = new Map({
		points: new OrderedMap(points),
		lines: new Map(jsonObject.sceneState.lines),
		selected: new Set(),
		selectionArea: null,
		mode: 'cursor',
		gizmoDirection: null
	})

	const cameraState = new Map(jsonObject.cameraState)

	updateCounter(sceneState)

	return { sceneState, cameraState }
}

//Ну это просто - объединяем вершины и линии, попутно следя!!! за ключами
export function appendSceneState (sceneState, newState) {

	let mapPoints = new Map()
	let points = new OrderedMap()
	let lines = new Map()
	
	newState.get('points').forEach((point, key) => {
		const newKey = genKey()
		points = points.set(newKey, point)
		mapPoints = mapPoints.set(key, newKey)
	})

	newState.get('lines').forEach(line => {

		lines = lines.set( ...makeLine(mapPoints.get(line[0]), mapPoints.get(line[1])) )	
	})

	console.log(points.toObject())
	console.log(lines.toObject())

	return sceneState.merge({
		points: sceneState.get('points').merge(points),
		lines: sceneState.get('lines').merge(lines)
	})
}