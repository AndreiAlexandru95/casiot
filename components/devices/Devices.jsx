import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'

export default class Devices extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			socket: null,
		}

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	handleData(data) {
		let result = JSON.parse(data);
		this.getDeviceList();
	}

	getDeviceList() {
		this.serverRequest = $.get('http://192.168.10.201:8000/api/devices/?format=json', function(result) {
			this.setState({
				device_list: result,
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceList()
		this.setState({
			socket: this.refs.socket
		});
	}

	sendSocketMessage(message) {
		const socket = this.state.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	render() {
		return(
			<div className="row d-size m-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<ListDevices device_list={this.state.device_list} current_user={this.props.current_user} sendSocketMessage={this.sendSocketMessage}/>
				<div className="col-3 p-0 card border info-bg-color">
					<div className="card-header card-head-font">
						Information
					</div>
					<div className="card-body">
						<div>
							<p className="inf-title">Devices</p>
							{this.props.current_user.is_superuser &&
								<div>
									<p className="inf-subtitle">Flush</p>
									<p className="inf-text">Click to delete all present device records</p>
								</div>
							}
							{!this.props.current_user.is_superuser &&
								<div>
									<p className="inf-subtitle">Add</p>
									<p className="inf-text">Click to use your device key to add a new device to your list</p>
									<p className="inf-subtext">Contact Cascoda for details on how to aquire keys</p>
								</div>
							}
							<p className="inf-title">Details</p>
							<p className="inf-text">Displays the basic id information of the selected device/devices</p>
							<p className="inf-subtitle">More</p>
							<p className="inf-text">Click to see all the available information of & control the selected device</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class ListDevices extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			open: false,
			dev_key: '',
		}
	}

	openModal(event) {
		this.setState({
			open: true,
		})
	}

	closeModal(event) {
		this.setState({
			open: false,
		})
	}

	handleSignDevice(event) {
		this.props.sendSocketMessage({
			command: 'cmd-sn',
			dev_key: this.state.dev_key,
			user: this.props.current_user.username,
		})
	}

	flushDBClick(event) {
		this.props.sendSocketMessage({
			command: 'cmd-fl_db'
		})
	}

	renderDeviceList() {
		let devices = this.props.device_list

		if (devices.length > 0) {
			return devices.map(function(device) {
				let dev_det_id = "dev_det_".concat(device.id.toString())
				return(
					<div className="border-bottom" key={device.id}>
						<button type="button" className="btn btn-block b-t-font m-bg-color" data-toggle="collapse" data-target={"#"+dev_det_id}>
							<img src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center">{this.props.current_user.username}@dev{device.id}</span>
						</button>
					</div>
				)
			}, this)
		} else {
			return (
				<p className="info-font">This account has no devices</p>
			)
		}
	}

	renderDeviceDetails() {
		let devices = this.props.device_list

		if (devices.length > 0) {
			return devices.map(function(device) {
				let dev_det_id = "dev_det_".concat(device.id.toString())
				return(
					<div className="collapse border-bottom p-4" key={device.id} id={dev_det_id}>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Name & ID</span>
							<span className="t-font">{device.name} {device.id}</span>
						</p>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Description</span>
							<span className="t-font">{device.info}</span>
						</p>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Address</span>
							<span className="t-font">{device.ip_addr}</span>
						</p>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Commands</span>
							<span className="t-font">{device.commands}</span>
						</p>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Value</span>
							<span className="t-font">{device.value}</span>
						</p>
						<p className="d-flex justify-content-between">
							<span className="b-t-font">Warnings&Errors</span>
							<span className="t-font"><span className="war-log-color">{device.number_of_war}</span> & <span className="err-log-color">{device.number_of_err}</span></span>
						</p>
						<a className="btn btn-block b-t-font btn-primary" href={"/device/"+device.id+"/"}>More...</a>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-9 row m-0 p-0">
				<div className="col-4 p-0 card border lblue-bg-color">
					<div className="card-header card-head-font d-flex justify-content-between">
						<div>
							Devices
						</div>
						<div>
							{this.props.current_user.is_superuser &&
								<button type="button" className="btn btn-block b-t-font m-bg-color" onClick={this.flushDBClick.bind(this)}>
									<img src="../../static/third_party/open-iconic-master/svg/aperture.svg" alt="-"/> <span className="text-center">Flush</span>
								</button>
							}
							{!this.props.current_user.is_superuser &&
								<button type="button" className="btn btn-block b-t-font m-bg-color" onClick={this.openModal.bind(this)}>
									<img src="../../static/third_party/open-iconic-master/svg/plus.svg" alt="+"/> <span className="text-center">Add</span>
								</button>
							}
						</div>
					</div>
					<div className="card-body p-0">
						{this.renderDeviceList()}
					</div>
				</div>
				<Modal open={this.state.open} onClose={this.closeModal.bind(this)} little>
					<div className="p-4">
						<h4>Sign Device</h4>
						<hr/>
						<form onSubmit={this.handleSignDevice.bind(this)}>
							<label>
								Device Key: 
								<input type="text" value={this.state.dev_key} onChange={function(event) {
									this.setState({
										dev_key: event.target.value
									})
								}.bind(this)} />
							</label>
							<input type="submit" value="Submit" />
						</form>
					</div>
				</Modal>
				<div className="col-8 p-0 card border bg-light">
					<div className="card-header card-head-font">
						Details
					</div>
					<div className="card-body p-0">
						{this.renderDeviceDetails()}
					</div>
				</div>
			</div>
		)
	}
}

Devices.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
}

ListDevices.propTypes = {
	device_list: PropTypes.array,
	current_user: PropTypes.object
}