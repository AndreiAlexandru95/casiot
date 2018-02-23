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
					<div className="card bg-light mb-md-2" key={device.id}>
						<div className="card-body no-pad-h">
							<div className="d-flex flex-column">
								<a className="card-title text-center text-success font-weight-bold border-bottom border-secondary dblue-bg-color" href={"/api/device/"+device.id+"/"}>{device.name}@dev{device.id}</a>
								<p className="d-flex justify-content-between mx-md-3">
									<span className="text-info font-weight-bold">Description:</span>
									<span className="text-muted font-weight-bold">{device.info}</span>
								</p>
								<p className="d-flex justify-content-between mx-md-3">
									<span className="text-info font-weight-bold">Address:</span>
									<span className="font-weight-bold">{device.ip_addr}</span>
								</p>
								<p className="d-flex justify-content-between mx-md-3">
									<span className="text-info font-weight-bold">Commands:</span>
									<span className="text-warning font-weight-bold">{device.commands}</span>
								</p>
								<p className="d-flex justify-content-between mx-md-3">
									<span className="text-info font-weight-bold">Current value:</span>
									<span className="text-danger font-weight-bold">{device.value}</span>
								</p>
							</div>
						</div>
					</div>
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
				<div className="card bg-light no-pad-h border rounded card-t-detail">
					<div className="card-header blue-t-color no-pad-h card-f-header">
						Available devices
					</div>
					<div className="card-body no-pad-h lblue-bg-color">
						{this.renderDeviceList()}
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
				<div className="card bg-light no-pad-h border-success card-t-detail">
					<div className="card-header blue-t-color no-pad-h card-f-header">
						Console
					</div>
					<div className="card-body no-pad-h">
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