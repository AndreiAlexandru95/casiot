import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import AdvMultiLineChart from '../dashboard/AdvMultiLineChart'

export default class DeviceCharts extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			compare_dev: '',
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

	handleDeviceClick(device_id, event) {
		let device = device_id.toString().concat("-")
		let compare_dev = this.state.compare_dev
		let index = compare_dev.indexOf(device)
		if (index == 0) {
			compare_dev = compare_dev.substr(2)
		} else if (index == compare_dev.length - 2 && compare_dev.length != 0) {
			compare_dev = compare_dev.slice(0, -2)
		} else if (index > -1) {
			compare_dev.replace(device,'')
		} else {
			compare_dev = compare_dev.concat(device)
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
				<div className="col-3 p-0 card border lblue-bg-color">
					<div className="card-header card-head-font">
						Devices
					</div>
					<div className="card-body p-0">
						{this.renderDeviceList()}
					</div>
				</div>
				<div className="col-9 p-0 card border bg-light">
					<div className="card-header card-head-font">
						Charts
					</div>
					<div className="card-body p-0 ">
						<AdvMultiLineChart devices={this.state.compare_dev} />
					</div>
					<div className="card border info-bg-color">
						<div className="card-header card-head-font">
							Information
						</div>
						<div className="card-body i-height add-scroll">
							<div>
								<p className="inf-title">Devices</p>
								<p className="inf-text">List of devices you can choose from to see/compare their charts.</p>
								<p className="inf-title">Charts</p>
								<p className="inf-text">Charts with sliders that manipulate the data you require.</p>
								<p className="inf-subtitle"> Date & Bucket Gradients</p>
								<p className="inf-text">This gradiends either control the time interval the data is averaged or the bucket size of the Largest Triangle Three Bucket data sampler.</p>
								<p className="inf-text">In case the Bucket Gradient is not checked.</p>
								<p className="inf-subtext">None - yields real time data(last 200 entries) for the selected devices.</p>
								<p className="inf-subtext">5m - yields the entire data averaged every 5 minutes.</p>
								<p className="inf-subtext">15m - yields the entire data averaged every 15 minutes.</p>
								<p className="inf-subtext">30m - yields the entire data averaged every 30 minutes.</p>
								<p className="inf-subtext">1h - yields the entire data averaged every 1 hour.</p>
								<p className="inf-subtext">1d - yields the entire data averaged every 1 day.</p>
								<p className="inf-text">In case the Bucket Gradient is checked.</p>
								<p className="inf-subtext">None - yields all the data recorded for the device.</p>
								<p className="inf-subtext">Note: Date Gradient None doesn't return real time data if the Bucket Gradient is checked.</p>
								<p className="inf-subtext">The other Date Gradient choices return the data specified above and apply the sampler with the chosen gradient.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}