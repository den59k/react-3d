function toCanvas(points, canvas){
	const max = Math.max(canvas.width, canvas.height)

	return [
		points[0]*max + canvas.width/2,
		canvas.height/2 - points[1]*max
	]
}

export function drawLine (canvas, points){
	const ctx = canvas.getContext('2d')
	ctx.beginPath()
	ctx.moveTo(...toCanvas(points[0], canvas))
	ctx.lineTo(...toCanvas(points[1], canvas))
	ctx.stroke()
}

export function drawPoints (canvas, points, color='#000'){
	const ctx = canvas.getContext('2d')

	ctx.fillStyle = color
	
	points.forEach(point => {
		ctx.beginPath()
		ctx.arc(...toCanvas(point, canvas), 5*point[3], 0, 2 * Math.PI, false)
		ctx.fill()
	})
}

export function drawLines(canvas, points, lines, color='#000'){
	const ctx = canvas.getContext('2d')

	ctx.lineWidth = 1
	ctx.strokeStyle = color
	
	lines.forEach(line => {
		if(!points.get(line[0]) || !points.get(line[1])) return
		drawLine(canvas, [ points.get(line[0]), points.get(line[1]) ])
	})
}

export function drawGrid (canvas, grid){
	const ctx = canvas.getContext('2d')
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	
	ctx.lineWidth = 1
	ctx.strokeStyle = '#CCC'

	grid.forEach(line => drawLine(canvas, line))

}

const gizmoColors = {
	right: '#E07777',
	up: '#63E34F',
	forward: '#25B5F2'
}

export function drawGizmo(canvas, gizmo, gizmoDirection){
	const ctx = canvas.getContext('2d')

	if(!gizmo.get('center')) return

	Object.keys(gizmoColors).forEach(key => {

		ctx.fillStyle = ctx.strokeStyle = gizmoColors[key]

		if(gizmoDirection === null)
		Object.keys(gizmoColors).forEach(key2 => {
			if(gizmo.has(key+'_'+key2)){
				ctx.beginPath()
				ctx.lineWidth = 1
				drawLine(canvas, [ gizmo.get('_'+key), gizmo.get(key+'_'+key2) ])
				drawLine(canvas, [ gizmo.get('_'+key2), gizmo.get(key+'_'+key2) ])
			}
		})

		if(!gizmo.has(key) || (gizmoDirection !== null && gizmoDirection !== key)) return
		ctx.beginPath()
		ctx.lineWidth = 2
		drawLine(canvas, [ gizmo.get('center'), gizmo.get(key) ])

		ctx.beginPath()
		ctx.arc(...toCanvas(gizmo.get(key), canvas), 6, 0, 2 * Math.PI, false)
		ctx.fill()
	})
}

export function drawSelectionArea (canvas, area){
	const ctx = canvas.getContext('2d')
	ctx.strokeStyle = '#AEAEAE'
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.rect(...area)
	ctx.stroke()
}
