import React from 'react'

export default class Test extends  React.Component{

	constructor (props){
		super(props)
		this.state = { counter: 5 }
	}

	componentDidMount () {
		this.setState({counter: this.state.counter + 1});
		console.log(this.state.counter);
	}

	render (){
		return <div></div>
	}
}