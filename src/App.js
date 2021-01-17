import { useState } from 'react'
import Editor, { createSceneState, createCameraState, createHistoryState } from 'editor'
import { findPointOnPlane, findPointOnVector, project, getAngle, add } from 'editor/calc'

import { pushHistory, stepBack, getNowState, stepForward } from 'editor/history-tools'
import { 
	selectPoint, 
	transformSelection, 
	selectPointsOnArea, 
	extrudeSelected, 
	deleteSelected, 
	collapseSelected,
	connectSelected,
	removeLinesSelected
} from 'editor/tools'
import { rotateCamera, translateCamera } from 'editor/camera-tools'
import { getCanvasPoint, normalizePoint } from 'editor/2d-tools'
import { stateToJson, jsonToState, appendSceneState } from 'editor/save-tools'
import { useKeyDown, useKeyPress, mouseMove } from 'editor/libs'

import LeftPanel from './editor-modules/left-panel'
import CornerMenu from './editor-modules/corner-menu'

import { BsCursorFill, BsArrowsMove, BsLink, BsTrash } from 'react-icons/bs'
import { BiRotateRight, BiUnlink, BiCollapse } from 'react-icons/bi'
import { IoMdResize } from 'react-icons/io'

import { localRotate, localScale, translate } from 'editor/calc/matrices'
import { hypot, multiply, subtract } from 'mathjs'

import { saveFile, loadFile } from './libs/file'

const leftMenuButtons = {
	cursor: { icon: <BsCursorFill/> },
	move: { icon: <BsArrowsMove/> },
	rotate: { icon: <BiRotateRight size="1.1em"/> },
	scale: { icon: <IoMdResize/> }
}

const rightMenuButtons = {
	link: { icon: <BsLink/>, title: "Соединить точки (B)" },
	unlink: { icon: <BiUnlink/>, title: "Разъединить точки (Backspace)" },
	collapse: { icon: <BiCollapse/>, title: "Слиять точки в одну (C)" },
	remove: { icon: <BsTrash/>, title: "Удалить точки (Delete)" }
}

const vectors = {
	forward: [0, 0, 1],
	up: [0, 1, 0],
	right: [1, 0, 0]
}

//Нам придется переопределить еще тройку векторов для вращения, ибо они не совпадают с теми, что на экране
const rotateVectors = {
	forward: vectors.up,
	up: vectors.right,
	right: vectors.forward
}

const initState = createSceneState()

export default function Home() {

	const [ sceneState, setSceneState ] = useState(initState)
	const [ cameraState, setCameraState ] = useState(() => createCameraState())
	const [ historyState, setHistoryState ] = useState(() => createHistoryState(initState))

	//Дополнительная функция, которая обновляет стейт и сохраняет его в историю
	const setSceneStateSave = (reducer) => {
		setSceneState(sceneState => {
			const newState = reducer(sceneState)
			setHistoryState(pushHistory(historyState, newState))
			return newState
		})
	}

	useKeyPress({
		'KeyA': () => setCameraState(state => translateCamera(state, [-0.4, 0, 0])),
		'KeyD': () => setCameraState(state => translateCamera(state, [0.4, 0, 0])),
		'KeyW': () => setCameraState(state => translateCamera(state, [0, 0, 0.8])),
		'KeyS': () => setCameraState(state => translateCamera(state, [0, 0, -0.8])),
	})

	useKeyDown ({
		'Delete': () => setSceneStateSave(state => deleteSelected(state)),
		'KeyC': () => setSceneStateSave(state => collapseSelected(state)),
		'KeyB': () => setSceneStateSave(state => connectSelected(state)),
		'Backspace': () => setSceneStateSave(state => removeLinesSelected(state)),
		'KeyZ': (e) => { 
			if(!e.ctrlKey) return
			setHistoryState(historyState => {
				const newHistoryState = stepBack(historyState)
				setSceneState( getNowState(newHistoryState) )
				return newHistoryState
			})
		},
		'KeyY': (e) => {
			if(!e.ctrlKey) return
			setHistoryState(historyState => {
				const newHistoryState = stepForward(historyState)
				if(newHistoryState !== null){
					setSceneState(getNowState(newHistoryState))
					return newHistoryState
				}
				return historyState
			})
		}
	}, [ historyState ])			//Здесь немножко странно написано, потому что иначе оно странно работает :(

	const onCameraMove = (e) => {
		if(!e.ctrlKey){
			mouseMove(e, delta => setCameraState(state => rotateCamera(state.set('rotation', cameraState.get('rotation')), delta)))
		}
	}

	const onPointDown = (point, e) => {
		setSceneStateSave(sceneState => selectPoint(sceneState, point, !e.shiftKey))
	}

	const onGizmoDown = (direction, gizmo, e) => {
		let startState = sceneState.set('gizmoDirection', direction)
		const point = gizmo.get(direction)
		const center = gizmo.get('center')

		if(e.shiftKey)
			startState = extrudeSelected(startState)

		setSceneState(startState)
		
		const rect = e.currentTarget.getBoundingClientRect()
		
		mouseMove(e, (_delta, e) => {

			const pos = normalizePoint([e.clientX, e.clientY], rect)
			
			if(sceneState.get('mode') === 'move'){
				const planePoint = findPointOnVector(cameraState, pos, point, vectors[direction])
				const vector = project(subtract(planePoint, point), vectors[direction])
				
				setSceneState(transformSelection(startState, translate(vector)))
			}

			if(sceneState.get('mode') === 'rotate'){
				const planePoint = findPointOnPlane(cameraState, pos, point, rotateVectors[direction])
				let angle = getAngle(subtract(planePoint, center), subtract(point, center), rotateVectors[direction])

				if(e.ctrlKey) angle = Math.floor(angle / 15) * 15

				const matrix = localRotate (center, multiply(rotateVectors[direction], angle))

				setSceneState(transformSelection(startState, matrix).set('gizmoMatrix', matrix ))
			}

			if(sceneState.get('mode') === 'scale'){
				const planePoint = findPointOnVector(cameraState, pos, point, vectors[direction])
				const vector = project(subtract(planePoint, point), e.ctrlKey? [1, 1, 1]: vectors[direction])
				
				const one = 1/hypot(subtract(point, center))
				const matrix = localScale(center, add([1, 1, 1], multiply(vector, one)))
				
				setSceneState(transformSelection(startState, matrix).set('gizmoMatrix', matrix ))
			}

		}, () => setSceneStateSave(sceneState => sceneState.merge({ gizmoDirection: null, gizmoMatrix: null })))
	}

	const onCanvasDown = (e) => {
		const startPoint = getCanvasPoint(e)
		const canvas = e.currentTarget
		const shiftKey = e.shiftKey

		mouseMove(e, 
			delta => setSceneState(sceneState => sceneState.set('selectionArea', [ ...startPoint, delta[0], delta[1] ])),
			() => setSceneStateSave(sceneState => selectPointsOnArea(sceneState, cameraState, canvas, !shiftKey))
		)
	}

	const onLeftMenuClick = (key) => {
		setSceneState(sceneState => sceneState.set('mode', key))
	}

	const onRightMenuClick = (key) => {
		if(key === 'link') setSceneStateSave(state => connectSelected(state))
		if(key === 'unlink') setSceneStateSave(state => removeLinesSelected(state))
		if(key === 'collapse') setSceneStateSave(state => collapseSelected(state))
		if(key === 'remove') setSceneStateSave(state => deleteSelected(state))
	}
	
	const clearAll = () => {
		setHistoryState(createHistoryState(initState))
		setSceneState(initState)
		setCameraState(createCameraState())
	}

	const saveAll = () => {
		const json = stateToJson(sceneState, cameraState)
		saveFile(json)
	}

	const loadAll = () => {
		loadFile().then((json) => {
			const { sceneState, cameraState } = jsonToState(json)
			setSceneState(sceneState)
			setCameraState(cameraState)
			setHistoryState(createHistoryState(sceneState))
		})
	}

	const appendAll = () => {
		loadFile().then((json) => {
			const { sceneState } = jsonToState(json)
			setSceneStateSave(state => appendSceneState(state, sceneState))
		})
	}

	const fileMenuItems = [
		{ title: "Новый проект", onClick: () => clearAll() },
		{ title: "Сохранить проект", onClick: () => saveAll() },
		{ title: "Открыть проект", onClick: () => loadAll() },
		{ title: "Загрузить и объединить", onClick: () => appendAll() }
	]

	return (
		<div style={{position: "relative"}}>
			<Editor 
				sceneState={sceneState} 
				cameraState={cameraState}
				onCameraMove={onCameraMove}
				onPointDown={onPointDown}
				onGizmoDown={onGizmoDown}
				onCanvasDown={onCanvasDown}
			/>
			<LeftPanel buttons={leftMenuButtons} active={sceneState.get('mode')} onClick={onLeftMenuClick}/>
			<LeftPanel buttons={rightMenuButtons} onClick={onRightMenuClick} style={{left: 'auto', right: '10px'}}/>
			<CornerMenu buttons={fileMenuItems}/>
		</div>
	)
}
