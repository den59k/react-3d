import { inv, matrix, multiply } from 'mathjs'

export const translate = (point) => {
	return ([
		[ 1, 0, 0, 0 ],
		[ 0, 1, 0, 0 ],
		[ 0, 0, 1, 0 ],
		[ point[0], point[1], point[2], 1 ]
	])
} 

export const one = () => {
	return ([
		[ 1, 0, 0, 0 ],
		[ 0, 1, 0, 0 ],
		[ 0, 0, 1, 0 ],
		[ 0, 0, 0, 1 ]
	])
}

export const rotateX = (angle) => {
	const r = angle*Math.PI/180;
	return ([
		[ 1, 0, 0, 0 ],
		[ 0, Math.cos(r), -Math.sin(r), 0 ],
		[ 0, Math.sin(r), Math.cos(r), 0 ],
		[ 0, 0, 0, 1 ]
	])
}

export const rotateY = (angle) => {
	const r = angle*Math.PI/180;
	return ([
		[ Math.cos(r), 0, Math.sin(r), 0 ],
		[ 0, 1, 0, 0 ],
		[ -Math.sin(r), 0, Math.cos(r), 0 ],
		[ 0, 0, 0, 1 ]
	])
}

export const rotateZ = (angle) => {
	const r = angle*Math.PI/180;
	return ([
		[ Math.cos(r), -Math.sin(r), 0, 0 ],
		[ Math.sin(r), Math.cos(r), 0, 0 ],
		[ 0, 0, 1, 0 ],
		[ 0, 0, 0, 1 ]
	])
}

export const rotate = (vector) => {
	return multiply(multiply(rotateZ(vector[2]), rotateX(vector[0])), rotateY(vector[1]))
}

export const localRotate = (position, rotation) => {
	return multiply(inv(translate(position)), rotate(rotation), translate(position))
}

export const scale = (vector) => {
	return ([
		[ vector[0], 0, 0, 0 ],
		[ 0, vector[1], 0, 0 ],
		[ 0, 0, vector[2],  0 ],
		[ 0, 0, 0, 1 ]
	])
}

export const localScale = (position, vector) => {
	return multiply(inv(translate(position)), scale(vector), translate(position)) 
}

export const fov = (r) => {
	return ([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, r],
		[0, 0, 0, 1]
	])
}