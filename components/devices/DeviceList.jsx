import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'


export default class DeviceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			device_list: []
		};

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	getDeviceList() {
		this.serverRequest = $.get('http://localhost:8000/api/devices/?format=json', function(result) {
			console.log(result);
			this.setState({
				device_list: result
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceList();
	}

	sendSocketMessage(message){
		const socket = this.refs.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	// This gets triggered when a message from the socket is received
	handleData(data) {
		let result = JSON.parse(data);
		console.log(result);
		this.getDeviceList();
		this.setState({
			device_list: result
		})
	}

	render() {
		return (
			<div>
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Devices device_list={this.state.device_list} />
			</div>
		);
	}
}

class Devices extends React.Component {
	constructor(props) {
		super(props)
	}

	renderDeviceList() {
		let devices = this.props.device_list

		if (devices.length > 0) {
			return devices.map(function(device) {
				return (
					<div className="text-muted pt-md-3" key={device.id}>
						<p className="border-bottom border-gray pb-md-3 mb-md-0 white-t-color">
							<strong className="d-block red-t-color">@{device.id} {device.name}</strong>
							{device.info} {device.ip_addr} {device.commands} {device.value}
						</p>
					</div>
				)
			}, this)
		} else {
			return 
		}
	}

	render() {
		return (
			<div className="rounded border box-shadow my-md-3 p-md-3 lblue-bg-color">
				<h3 className="border-bottom border-gray pb-md-2 mb-md-0 blue-t-color">Available devices</h3>
				{this.renderDeviceList()}
			</div>
		);
	}
}

Devices.propTypes = {
	dev_list: PropTypes.array
}


DeviceList.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};