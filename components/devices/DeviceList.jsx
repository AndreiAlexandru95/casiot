import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'


export default class DeviceList extends React.Component {
	constructor(props) {
		super(props);
		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	sendSocketMessage(message){
		const socket = this.refs.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	// This gets triggered when a message from the socket is received
	handleData(data) {
		let result = JSON.parse(data);
		console.log(result);
	}

	render() {
		return (
			<div>
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<h2>Salut la toata lumea!</h2>
			</div>
		)
	}
}

DeviceList.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};