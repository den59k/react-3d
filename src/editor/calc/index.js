import { multiply, inv, divide, det, cross, subtract, dot, hypot } from 'mathjs'
import { translate, rotate, fov } from './matrices'

import getGrid from './grid'
import getGizmo from './gizmo'

export { getGrid, getGizmo }

export function add (point1, point2){
	return point1.map((val, index) => val + point2[index])
}

export function sqrDistance (point1, point2){
	return point1.reduce((sum, _, index) => sum + (point1[index]-point2[index]) * (point1[index]-point2[index]))
}

export function distance (point1, point2){
	return Math.sqrt(sqrDistance(point1, point2))
}

export function cameraState2Matrix (cameraState){

	return multiply(
		inv(multiply(
			rotate(cameraState.get('rotation')),
			translate(cameraState.get('position')),
		)),
		fov(cameraState.get('fov'))
	)
}

export function pointsTo2D (points, cameraState, additionalMatrix){
	let matrix = cameraState2Matrix(cameraState)
	if(additionalMatrix) matrix = multiply(additionalMatrix, matrix)

	return points.map(point => mul(point, matrix)).filter(point => !!point)
}

//Функция, которая расчитывает проекцию 2D вектора на 3D вектор
export function calcVector (cameraState, delta, point, vector){
	const matrix = cameraState2Matrix(cameraState)
	const points = pointsTo2D([ point, add(point, vector) ])
	
	console.log(points)	
}
	
// Функция, которая расчитывает луч из камеры до плоскости (недоделанная)
// https://matworld.ru/analytic-geometry/tochka-peresechenija-prjamoj-i-ploskosti.php

export function findPointOnPlane (cameraState, point, planePoint, normal){
	
	const matrix = cameraState2Matrix(cameraState)

	const p1 = [...cameraState.get('position'), 1]
	const p2 = mul([...point, 0.98], inv(matrix), false)

	//console.log(point)
	//console.log(mul(planePoint, matrix))

	const matr = [
		[ p2[1]-p1[1], -(p2[0]-p1[0]), 0 ],
		[ 0, p2[2]-p1[2], -(p2[1]-p1[1]) ],
		[ normal[0], normal[1], normal[2] ]
	]

	const solution = [ 
		p1[0] * (p2[1] - p1[1]) - p1[1] * (p2[0] - p1[0]),
		p1[1] * (p2[2] - p1[2]) - p1[2] * (p2[1] - p1[1]),
		normal[0]*planePoint[0] + normal[1]*planePoint[1] + normal[2]*planePoint[2]
	]

	const changeColumn = (matr, column, index) => matr.map(
		(str, strIndex) => str.map((cell, columnIndex) => columnIndex === index? column[strIndex]: cell)
	)
		
	//Собственно, решаем по Крамеру
	const D = det(matr)
	const D1 = det(changeColumn(matr, solution, 0))
	const D2 = det(changeColumn(matr, solution, 1))
	const D3 = det(changeColumn(matr, solution, 2))

	const resolvePoint = [ D1/D, D2/D, D3/D ]

	return resolvePoint
}

//Функция, которая вычисляет вектор, который откладывается от planePoint, и по длине равен расстоянию до point
export function findPointOnVector(cameraState, point, planePoint, vector){
	
	const cameraRight = mul([ 1, 0, 0 ], rotate(cameraState.get('rotation')))
	const cameraUp = mul([ 0, 1, 0 ], rotate(cameraState.get('rotation')))

	const dotRight = dot(cameraRight.slice(0, 3), vector)
	const dotUp = dot(cameraUp.slice(0, 3), vector)

	const normal = cross(vector, (dotRight < dotUp? cameraRight: cameraUp ).slice(0, 3))

	const pointOnPlane = findPointOnPlane(cameraState, point, planePoint, normal)

	return pointOnPlane
}

//Ну это просто - проекция вектора vector на вектор onVector
export function project (vector, onVector){
	const magnitude = dot(vector, onVector)

	return multiply(onVector, magnitude)
}

//Это просто полифилл, не обращайте внимания
const sign = (i) => i < 0? -1: 1

//Тоже довольно просто - угол между двумя векторами
export function getAngle (vector1, vector2, normal){
	const cos = dot(vector1, vector2)/ (hypot(vector1) * hypot(vector2))

	const _sign = normal? sign(dot(cross(vector1, vector2), normal)): 1

	return Math.acos(cos) / Math.PI * 180 * _sign
}

//Просто центр точек
export function getCenter (points){
	if(points.size === 0) return null
	
	const sum = points.reduce((sum, point) => add(sum, point), [0, 0, 0])

	return sum.map(val => val/points.size)
}

//Просто функция, которая умножает точку и нормализует ее
export function mul (point, matrix, returnNull=true){
	const p = [ ...point, 1 ]
	const res = multiply(p, matrix)

	if(res[3] < 0.99 && returnNull) return null

	if(Math.abs(res[3] - 1) > 0.01)
		return divide(res, res[3])
	
	return res
}