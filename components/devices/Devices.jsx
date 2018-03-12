import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'

export default class Devices extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			device_list: []
		}
	}

	handleData(data) {
		let result = JSON.parse(data);
		console.log(result);
		this.getDeviceList();
	}

	getDeviceList() {
		this.serverRequest = $.get('http://localhost:8000/api/devices/?format=json', function(result) {
			this.setState({
				device_list: result,
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceList()
	}

	render() {
		return(
			<div className="row d-size m-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<ListDevices device_list={this.state.device_list} current_user={this.props.current_user} />
				<div className="col-3 p-0 card border p-bg-color">
					<div className="card-header card-head-font">
						Information
					</div>
					<div className="card-body">
						Body
					</div>
				</div>
			</div>
		)
	}
}

class ListDevices extends React.Component {
	constructor(props) {
		super(props)
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
						<a className="btn btn-block b-t-font g-t-color bl-bg-color" href={"/device/"+device.id+"/"}>More...</a>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-9 row m-0 p-0">
				<div className="col-4 p-0 card border lg-bg-color">
					<div className="card-header card-head-font">
						Devices
					</div>
					<div className="card-body p-0">
						{this.renderDeviceList()}
					</div>
				</div>
				<div className="col-8 p-0 card border g-bg-color">
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