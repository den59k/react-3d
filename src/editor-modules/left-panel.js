import cn from 'classnames'
import styles from './style.module.sass'


export default function LeftPanel({buttons, active, onClick, style}){

	return (

		<div className={cn(styles.menu, styles.leftMenu)} style={style}>
			{Object.keys(buttons).map(key => (
				<button title={buttons[key].title} key={key} className={cn(key === active && styles.active)} onClick={() => onClick(key)}>
					{buttons[key].icon}
				</button>
			))}
		</div>
	)
}