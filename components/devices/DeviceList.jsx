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
				let dev_det_id = "dev_det_".concat(device.id.toString());

				return (
					<div className="card bg-light mb-md-2" key={device.id}>
						<div className="card-body no-pad-h">
							<div className="d-flex flex-column">
								<p className="card-title font-weight-bold border-bottom border-secondary dblue-bg-color mb-md-0 d-flex justify-content-between">
									<button type="button" className="btn text-white font-weight-bold dblue-bg-color" data-toggle="collapse" data-target={"#"+dev_det_id}>+</button>
									<button type="button" className="btn font-weight-bold dblue-bg-color green-t-color align-self-center" data-toggle="collapse" data-target={"#"+dev_det_id}>{device.name}@dev{device.id}</button>
									<span className="opac">Opac</span>
								</p>
								<div id={dev_det_id} className="collapse py-md-3 orange-bg-color">
									<div className="d-flex flex-column">
										<p className="d-flex justify-content-between mx-md-3">
											<span className="text-dark font-weight-bold">Description:</span>
											<span className="text-dark font-weight-bold">{device.info}</span>
										</p>
										<p className="d-flex justify-content-between mx-md-3">
											<span className="text-dark font-weight-bold">Address:</span>
											<span className="text-dark font-weight-bold">{device.ip_addr}</span>
										</p>
										<p className="d-flex justify-content-between mx-md-3">
											<span className="text-dark font-weight-bold">Commands:</span>
											<span className="text-dark font-weight-bold">{device.commands}</span>
										</p>
										<p className="d-flex justify-content-between mx-md-3">
											<span className="text-dark font-weight-bold">Current value:</span>
											<span className="text-dark font-weight-bold">{device.value}</span>
										</p>
										<a className="btn d-inline btn-success text-center font-weight-bold align-self-center" href={"/api/device/"+device.id+"/"}>Details</a>
									</div>
								</div>
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
				<div className="card dark-bg-color no-pad-h border rounded card-t-detail">
					<div className="card-header text-white no-pad-h card-f-header">
						Available devices
					</div>
					<div className="card-body no-pad-h pt-md-2">
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
			<p className="card-f-header text-white">Console to be continued soon ...</p>
		)
	}

	render() {
		return (
			<div className="col-md-6">
				<div className="ccard dark-bg-color no-pad-h border rounded card-t-detail">
					<div className="card-header text-white no-pad-h card-f-header">
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