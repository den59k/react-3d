import { findPointsOnArea } from './2d-tools'
import { getCenter, mul, pointsTo2D } from './calc'
import { translate } from './calc/matrices'
import { Map, Set } from 'immutable'
import { forEach } from 'mathjs'

let counter = 10000

//Метод, который просто генерирует уникальное значение (нет)
export function genKey(){
	return counter++
}

export function updateCounter (sceneState){
	const maxKey = sceneState.get('points').keySeq().last()
	counter = maxKey+1
}

export function addPoint(sceneState, point, key){
	if(!key) key = genKey()

	return sceneState.set('points', sceneState.get('points').set(key, point))
}

export function makeLine (p1, p2){
	const hash = p1 < p2? p1.toString() + '-'+p2.toString(): p2.toString() + '-'+p1.toString()
	return [ hash, [p1, p2] ]
}

//Функция, которая соединяет 2 точки
export function connect (sceneState, p1, p2){
	
	const hash = p1 < p2? p1.toString() + '-'+p2.toString(): p2.toString() + '-'+p1.toString()
	if(sceneState.get('lines').has(hash)) return sceneState
	return sceneState.set('lines', sceneState.get('lines').set(hash, [p1, p2]))
}

export function selectPoint (sceneState, key, clear = true){
	if(clear)
		return sceneState.set('selected', sceneState.get('selected').clear().add(key))
	else
		return sceneState.set('selected', sceneState.get('selected').add(key))
}

export function selectPointsOnArea (sceneState, cameraState, canvas, clearSelection = true) {
	const points = pointsTo2D(sceneState.get('points'), cameraState)

	const selected = findPointsOnArea(points, sceneState.get('selectionArea'), canvas)

	return sceneState.merge({
		selectionArea: null,
		selected: clearSelection?selected: sceneState.get('selected').union(selected)
	})
}

export function deleteSelected (sceneState) {
	const selected = sceneState.get('selected')

	return sceneState.merge({
		points: sceneState.get('points').filter((_, key) => !selected.has(key)),
		lines: sceneState.get('lines').filter((_, line) => !selected.has(line[0]) && !selected.has(line[1])),
		selected: new Set()
	})
}

//Ну здесь все понятно - мы просто сливаем несколько точек в одну, попутно сохраняя их ребра
export function collapseSelected (sceneState){
	const selected = sceneState.get('selected')
	if(!selected || selected.size === 0) return sceneState
	
	const newKey = genKey()
	const center = getCenter(sceneState.get('points').filter((_, key) => selected.has(key)))

	let newSceneState = sceneState.set('points', sceneState.get('points').filter((_, key) => !selected.has(key)))
	newSceneState = addPoint(newSceneState, center, newKey)

	newSceneState.set('lines', newSceneState.get('lines').filter((line) => selected.has(line[0]) || selected.has(line[1])))
	
	sceneState.get('lines').forEach(line => {
		if(selected.has(line[0]) && selected.has(line[1])) return
		if(selected.has(line[0])) newSceneState = connect(newSceneState, line[1], newKey)
		if(selected.has(line[1])) newSceneState = connect(newSceneState, line[0], newKey)
	})

	return selectPoint(newSceneState, newKey)
}

export function connectSelected (sceneState){
	const selected = sceneState.get('selected')
	let state = sceneState
	selected.forEach((_, key1) => {
		selected.forEach((_, key2) => {
			if(key1 !== key2) state = connect(state, key1, key2)
		})
	})

	return state
}

export function removeLinesSelected (sceneState) {
	const selected = sceneState.get('selected')
	return sceneState.set('lines', sceneState.get('lines').filter( line => !(selected.has(line[0]) && selected.has(line[1])) ))
}

export function transformSelection (sceneState, matrix){
	
	return sceneState.set('points', sceneState.get('points').map(
		(point, key) => {
	
			return (sceneState.get('selected').has(key))? mul(point, matrix).slice(0, 3): point
		}
	))
}

export function extrudeSelected (oldSceneState){
	let sceneState = oldSceneState
	let selected = new Map()

	sceneState.get('selected').forEach(key => {
		const newPointKey = genKey()
		sceneState = addPoint(sceneState, sceneState.get('points').get(key), newPointKey)
		sceneState = connect(sceneState, key, newPointKey)
		selected = selected.set(key, newPointKey)
	})

	sceneState.get('lines').forEach(line => {
		if(selected.has(line[0]) && selected.has(line[1])) 
			sceneState = connect(sceneState, selected.get(line[0]), selected.get(line[1]))
	})

	sceneState = sceneState.set('selected', new Set(selected.valueSeq()))
	
	return sceneState
}