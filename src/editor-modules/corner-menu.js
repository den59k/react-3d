import { useEffect, useState } from 'react'
import cn from 'classnames'
import styles from './corner-menu.module.sass'

import { IoIosMenu } from 'react-icons/io'

export default function CornerMenu ({buttons}){

	const [ opened, setOpened ] = useState(false)

	useEffect(() => {

		if(opened)
			document.addEventListener('click', () => setOpened(false), { once: true })

	}, [opened])

	return (
		<div className={cn(styles.container)}>
			<button onClick={() => setOpened(true)}><IoIosMenu/></button>
			<div className={cn(styles.menu, opened === false && styles.closed)}>
				{buttons.map((button, index) => (
					<button key={index} onClick={button.onClick}>{button.title}</button>
				))}
			</div>
		</div>
	)
}