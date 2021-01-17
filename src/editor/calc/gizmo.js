import { Map } from 'immutable'
import { distance, pointsTo2D, add } from './index'

const size = 0.07
const k = 0.3

export default function getGizmo (center, cameraState, normalize = true){
	if(center === null) return null

	const _size = normalize? 5: distance(center, cameraState.get('position')) * size
	
	
	return new Map({
		center,
		right: add(center, [ _size, 0, 0 ]),
		up: add(center, [ 0, _size, 0 ]),
		forward: add(center, [ 0, 0, _size ]),

		_right: add(center, [ _size*k, 0, 0 ]),
		_up: add(center, [ 0, _size*k, 0 ]),
		_forward: add(center, [ 0, 0, _size*k ]),

		forward_right: add (center, [ _size*k, 0, _size*k ]),
		right_up: add (center, [ _size*k, _size*k, 0 ]),
		up_forward: add (center, [ 0, _size*k, _size*k ])
	})

}