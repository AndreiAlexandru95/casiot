import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import MultiLineChart from '../dashboard/MultiLineChart'

export default class DeviceCharts extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			compare_dev: [],
		}
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
	}

	handleData(data) {
		let result = JSON.parse(data)
		this.getDeviceList()
	}

	handleDeviceClick(device_id, event) {
		let compare_dev = this.state.compare_dev
		let index = compare_dev.indexOf(device_id)
		if (index > -1) {
			compare_dev.splice(index, 1)
		} else {
			compare_dev.push(device_id)
		}
		this.setState({
			compare_dev: compare_dev
		})
	}

	renderDeviceList() {
		let devices = this.state.device_list
		let username = this.props.current_user.username
		if (devices.length > 0) {
			return devices.map(function(device) {
				let key = "dev_det_".concat(device.id.toString())
				let device_id = device.id
				let handleDeviceClick = this.handleDeviceClick.bind(this, device_id)
				return (
					<div className="border-bottom" key={key}>
						<button type="button" className="btn btn-block b-t-font m-bg-color" value={device_id} onClick={handleDeviceClick}>
							<img src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center">{username}@dev{device.id}</span>
						</button>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="row d-size m-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="col-3 p-0 card border lg-bg-color">
					<div className="card-header card-head-font">
						Devices
					</div>
					<div className="card-body p-0">
						{this.renderDeviceList()}
					</div>
				</div>
				<div className="col-9 p-0 card border bl-bg-color">
					<div className="card-header card-head-font">
						Charts
					</div>
					<div className="card-body p-0 m-height">
						<MultiLineChart devices={this.state.compare_dev} width={898} height={466}/>
					</div>
					<div className="card border p-bg-color">
						<div className="card-header card-head-font">
							Information
						</div>
						<div className="card-body p-0 i-height">
							Body
						</div>
					</div>
				</div>
			</div>
		)
	}
}