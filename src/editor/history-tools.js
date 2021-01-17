export function pushHistory (historyState, sceneState){

	if(sceneState === getNowState(historyState)) return historyState

	const history = historyState.get('history')
	const step = historyState.get('nowStep')+1

	return historyState.merge({
		nowStep: step,
		history: (history.size === step? history: history.slice(0, step)).push(sceneState)
	})
}

export function getNowState(historyState){

	return historyState.get('history').get(historyState.get('nowStep'))
}

export function stepBack(historyState){
	if(historyState.get('nowStep') <= 0) return historyState

	return historyState.set('nowStep', historyState.get('nowStep') - 1)
}

export function stepForward (historyState){
	const step = historyState.get('nowStep')+1
	if(step >= historyState.get('history').size) return historyState
	return historyState.set('nowStep', step)
}