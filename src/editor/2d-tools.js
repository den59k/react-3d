import { Set } from 'immutable'

//Функция квадрата расстояния между 2мя 2D точками
function sqrDistance (point1, point2){
	return (point1[0]-point2[0])*(point1[0]-point2[0]) + (point1[1]-point2[1])*(point1[1]-point2[1])
}

export function findPointOnScreen (points, pos, radius = 0.00003){

	const target = points.findLastKey(point => sqrDistance(point, pos) < radius)
	return target
}

const border = 1
export function normalizePoint(point, rect){

	const left = rect.left + border
	const top = rect.top + border
	const width = rect.width - border * 2
	const height = rect.height - border * 2
	const aspect = width / height
	
	if(rect.width > rect.height)
		return [ (point[0]-left) / width - 0.5, (0.5 - (point[1]-top) / height) / aspect ]
	else
		return [ ((point[0]-left) / width - 0.5) * aspect, 0.5 - (point[1]-top) / height ]
}

export function normalizeVector(vector, rect){
	const max = Math.max(rect.width, rect.height) - border * 2
	return vector.map(val => val/max)
}

export function canvasPointToScreen (e){

	const rect = e.currentTarget.getBoundingClientRect()

	return normalizePoint([ e.clientX, e.clientY ], rect)
}

export function findPointsOnArea (points, area, canvas){

	if(!area || (Math.abs(area[2]) < 2 && Math.abs(area[3]) < 2)) return new Set()

	const _rect = canvas.getBoundingClientRect()
	const rect = { left: 0, top: 0, width: _rect.width, height: _rect.height }
	
	const left = (area[0] + (area[2] < 0? area[2]: 0)) - 4
	const right = (area[0] + (area[2] > 0? area[2]: 0)) + 4
	const top = (area[1] + (area[3] < 0? area[3]: 0))	- 4
	const bottom = (area[1] + (area[3] > 0? area[3]: 0)) + 4

	const startPoint = normalizePoint([left, bottom], rect)
	const endPoint = normalizePoint([right, top], rect)


	const filtered =  points.filter(
		point => point[0] > startPoint[0] && point[0] < endPoint[0] && point[1] > startPoint[1] && point[1] < endPoint[1]
	)
	
	return new Set(filtered.keySeq())
}

export function getCanvasPoint (e){
	const rect = e.currentTarget.getBoundingClientRect()
	return [ e.clientX - rect.left, e.clientY - rect.top ]
}
