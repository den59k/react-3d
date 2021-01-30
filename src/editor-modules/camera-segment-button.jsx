import cn from 'classnames'
import styles from './style.module.sass'

import { BiAnalyse, BiCrosshair } from 'react-icons/bi'
import { BsCameraVideoFill } from 'react-icons/bs'

const modes = {
	orbit: { icon: <BiAnalyse/>, title: "Орбитальная камера" },
	fps: { icon: <BiCrosshair/>, title: "Камера от первого лица" }
}

export default function CameraSegmentButton ({value, onChange}){

	return (
		<div className={cn(styles.menu, styles.cameraMenu)}>
			<div className={styles.icon}><BsCameraVideoFill/></div>
			{ Object.keys(modes).map(key => (
				<button key={key} className={cn(value === key && styles.active)} title={modes[key].title} onClick={() => onChange(key)}>
					{ modes[key].icon }
				</button>
			)) }
		</div>
	)
}