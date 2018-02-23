import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import styles from '../../static/css/casiot.css'

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
			<div className="row d-flex">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Devices device_list={this.state.device_list} />
				<Console />
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
					<li className="list-group-item" key={device.id} id="device_tree">
						<p className="d-flex flex-column">
						<a className="d-block text-center text-success font-weight-bold" href={"/api/device/"+device.id+"/"}>{device.name}@dev{device.id}</a>
						<span className="text-info">Info: <span className="black-t-color">{device.info}</span></span>
						<span className="text-info">IP: <span className="black-t-color">{device.ip_addr}</span></span>
						<span className="text-info">CMD: <span className="black-t-color">{device.commands}</span></span>
						<span className="text-info">Current value: <span className="black-t-color">{device.value}</span></span>
						</p>
					</li>
				)
			}, this)
		} else {
			return (
				<p>This account has no devices.</p>
			)
		}
	}

	render() {
		return (
			<div className="col-md-6">
				<div className="card bg-light no-pad-h border-warning">
					<div className="card-header blue-t-color no-pad-h card-f-header">
						Available devices
					</div>
					<div className="card-body no-pad-h">
						<ul className= "list-group list-group-flush">
							{this.renderDeviceList()}
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

class Console extends React.Component {
	constructor(props) {
		super(props)
	}

	renderConsole() {
		return (
			<p className="card-f-header">Console to be continued soon ...</p>
		)
	}

	render() {
		return (
			<div className="col-md-6">
				<div className="card bg-light no-pad-h border-success">
					<div className="card-header blue-t-color no-pad-h card-f-header">
						Console
					</div>
					<div className="card-body no-pad-h card-f-header">
						{this.renderConsole()}
					</div>
				</div>
			</div>
		);
	}
}

Devices.propTypes = {
	device_list: PropTypes.array
}


DeviceList.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};