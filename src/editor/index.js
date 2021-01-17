import { useEffect, useMemo, useRef, useState } from "react"
import { createCameraState, createSceneState, createHistoryState } from './init-state.js'
import { pointsTo2D, cameraState2Matrix, getCenter, getGrid, getGizmo } from './calc'
import { findPointOnScreen, findPointsOnArea, canvasPointToScreen, getCanvasPoint } from './2d-tools'
import { drawPoints, drawLines, drawGrid, drawSelectionArea, drawGizmo } from './drawing'
import { onMouseDown, cancel } from './libs'

export { createCameraState, createSceneState, createHistoryState }

export default function Editor ({sceneState, cameraState, onCameraMove, onPointDown, onGizmoDown, onCanvasDown}){
	
	const [ canvasSize, setCanvasSize ] = useState({width: 1200, height: 800})
	const canvasRef = useRef()

	//Мы высчитываем положение сетки каждый раз, как меняется положение камеры, таким образом оптимизируя сцену
	const grid = useMemo(() => getGrid(cameraState2Matrix(cameraState)), [ cameraState ])
	
	//Высчитываем таким же образом все точки сцены
	const _points = sceneState.get('points')
	const points = useMemo(() => pointsTo2D(_points, cameraState), [ _points, cameraState ])

	//А также 4 точки в центре выделенных точек
	const mode = sceneState.get('mode')
	const _selection = sceneState.get('selected')
	const gizmoMatrix = sceneState.get('gizmoMatrix')
	const _gizmo = useMemo(
		() => getGizmo( getCenter(_points.filter((_p, key) => _selection.has(key))), cameraState ), 
		[ _selection, _points, cameraState, mode ]
	)
	const gizmo = useMemo(() => _gizmo?pointsTo2D(_gizmo, cameraState, gizmoMatrix): null, [ _gizmo, gizmoMatrix ])

	useEffect(() => {
		
		drawGrid(canvasRef.current, grid)

		const selected = sceneState.get('selected')
		//Рисуем линии
		drawLines(canvasRef.current, points, sceneState.get('lines'), '#000000')

		//Рисуем обычные точки
		drawPoints(canvasRef.current, points.filter((_p, key) => !selected.has(key)), '#4D4D4D')

		if(gizmo && (sceneState.get('mode') === 'move' || sceneState.get('mode') === 'rotate' || sceneState.get('mode') === 'scale'))
			drawGizmo(canvasRef.current, gizmo, sceneState.get('gizmoDirection'))

		//А также рисуем выделенные точки
		drawPoints(canvasRef.current, points.filter((_p, key) => selected.has(key)), '#E13487')

		if(sceneState.get('selectionArea')) drawSelectionArea(canvasRef.current, sceneState.get('selectionArea'))

	}, [ sceneState, cameraState, canvasSize ])

	const _onMouseDown = (e) => {
		if(e.button === 2){
			onCameraMove(e)
		}

		if(e.button === 0){
			const selectedPoint = findPointOnScreen(gizmo? points.merge(gizmo): points, canvasPointToScreen(e))

			if(typeof selectedPoint === 'number') return onPointDown(selectedPoint, e)

			if(typeof selectedPoint === 'string' && _gizmo.has(selectedPoint)) 
				return onGizmoDown(selectedPoint, _gizmo, e)

			onCanvasDown(e)
		}
	}

	useEffect(() => {
		const resize = () => setCanvasSize({ width: window.innerWidth - 1, height: window.innerHeight - 4 })
		
		resize()
		window.addEventListener('resize', resize)
		return () => window.removeEventListener('resize', resize)
	}, [])

	return (
		<div>
			<canvas 
				ref={canvasRef} 
				onMouseDown={_onMouseDown}
				width={canvasSize.width} 
				height={canvasSize.height} 
				onContextMenu={cancel}
			/>
		</div>
	)

}