import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import styles from '../../static/css/casiot.css'

export default class DeviceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			device_list: [],
			logs: []
		};

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	getDeviceList() {
		this.serverRequest = $.get('http://192.168.10.201:8000/api/devices/?format=json', function(result) {
			this.setState({
				device_list: result,
			});
		}.bind(this))
	}

	getLogList() {
		this.serverRequest = $.get('http://192.168.10.201:8000/api/console/?format=json', function(result) {
			this.setState({
				logs: result,
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceList();
		this.getLogList();
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
		this.getLogList();
	}

	render() {
		return (
			<div className="row col-full ml-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Devices device_list={this.state.device_list} current_user={this.props.current_user}/>
				<Console logs={this.state.logs}/>
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
				let dev_det_id = "dev_det_".concat(device.id.toString());

				return (
					<div className="mb-lg-2" key={device.id}>
						<button type="button" className="btn font-weight-bold lh-bl-bg-color btn-block" data-toggle="collapse" data-target={"#"+dev_det_id}>
							<img src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center">{this.props.current_user.username}@dev{device.id}</span>
						</button>
					</div>
				)
			}, this)
		} else {
			return (
				<p>This account has no devices.</p>
			)
		}
	}

	renderDeviceDetails() {
		let devices = this.props.device_list

		if (devices.length > 0) {
			return devices.map(function(device) {
				let dev_det_id = "dev_det_".concat(device.id.toString());

				return (
					<div className="collapse mb-lg-2" key={device.id} id={dev_det_id}>
						<p className="d-flex justify-content-between mx-md-3">
							<span className="text-dark font-weight-bold">Name & ID:</span>
							<span className="text-dark">{device.name} {device.id}</span>
						</p>
						<p className="d-flex justify-content-between mx-md-3">
							<span className="text-dark font-weight-bold">Description:</span>
							<span className="text-dark">{device.info}</span>
						</p>
						<p className="d-flex justify-content-between mx-md-3">
							<span className="text-dark font-weight-bold">Address:</span>
							<span className="text-dark">{device.ip_addr}</span>
						</p>
						<p className="d-flex justify-content-between mx-md-3">
							<span className="text-dark font-weight-bold">Commands:</span>
							<span className="text-dark">{device.commands}</span>
						</p>
						<p className="d-flex justify-content-between mx-md-3">
							<span className="text-dark font-weight-bold">Current value:</span>
							<span className="text-dark">{device.value}</span>
						</p>
						<a className="btn btn-block btn-success text-center font-weight-bold" href={"/device/"+device.id+"/"}>More...</a>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-container row mx-0">
				<div className="card wh-bl-bg-color no-pad-h border card-t-detail col-left">
					<div className="card-header no-pad-h card-f-header">
						Devices
					</div>
					<ul className="list-group list-group-flush">
						{this.renderDeviceList()}
					</ul>
				</div>
				<div className="card lg-bg-color no-pad-h border card-t-detail col-center">
					<div className="card-header no-pad-h card-f-header">
						Details
					</div>
					<div className="card-body no-pad-h pt-lg-2">
						{this.renderDeviceDetails()}
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
		let logs = this.props.logs

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString());
				return (
					<li className="list-group-item" key={log_key}>
						{log.device_id} {log.type} {log.date} : {log.text}
					</li>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-right">
				<div className="card wh-bl-bg-color no-pad-h border card-t-detail">
					<div className="card-header no-pad-h card-f-header">
						Console
					</div>
					<ul className="list-group list-group-flush">
						{this.renderConsole()}
					</ul>
				</div>
			</div>
		);
	}
}

Devices.propTypes = {
	device_list: PropTypes.array,
	current_user: PropTypes.object
};


DeviceList.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};

Console.propTypes = {
	logs: PropTypes.array
}