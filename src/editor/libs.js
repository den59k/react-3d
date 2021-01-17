import { useEffect } from 'react'

//Функция, которая переделывает стандартный mousedown/mouseup в более удобный список методов
export const onMouseDown = (onMouseAction) => {
	return (e) => {
		const startPos = [ e.clientX, e.clientY ]
		onMouseAction(e, (_move, _end) => {
			const move = (e) => {
				const currentPos = [ e.clientX, e.clientY ]
				_move(currentPos.map((val, index) => val-startPos[index]))
			}
			
			document.addEventListener('mousemove', move)
			document.addEventListener('mouseup', (e) => {
				if(_end) _end(e)
				document.removeEventListener('mousemove', move)
			}, { once: true })
		})
	}
}

export const mouseMove = (e, onMove, onEnd) => {
	const startPos = [ e.clientX, e.clientY ]
	const move = (e) => {
		const currentPos = [ e.clientX, e.clientY ]
		const delta = currentPos.map((val, index) => val-startPos[index])
		onMove(delta, e)
	}

	document.addEventListener('mousemove', move)
	document.addEventListener('mouseup', e => {
		if(onEnd) onEnd(e)
		document.removeEventListener('mousemove', move)
	}, { once: true })
}

//Хук, который цепляет вызывает keyCallbacks в зависимости от нажатой клавиши
export const useKeyPress = (keyCallbacks) => {

	useEffect(() => {
		document.addEventListener('keydown', e => {

			if(e.code in keyCallbacks && !keyCallbacks[e.code].interval)
				keyCallbacks[e.code].interval = setInterval(() => keyCallbacks[e.code](), 20)
		})

		document.addEventListener('keyup', e => {
			if(e.code in keyCallbacks && keyCallbacks[e.code].interval){
				clearInterval(keyCallbacks[e.code].interval)
				delete keyCallbacks[e.code].interval
			}
		})
	}, [])
}

export const useKeyDown = (keyCallbacks, args = []) => {
	useEffect(() => {
		const keyDown = e => {
			if(e.code in keyCallbacks )
				keyCallbacks[e.code](e)
		}

		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
	}, args)
}


//Просто вспомогательная функция для лаконичности кода
export const cancel = (e) => {
	e.preventDefault()
}