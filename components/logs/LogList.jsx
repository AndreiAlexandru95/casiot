import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Log from './Log.jsx'

export default class LogList extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			current_dev: 0,
		}

		this.onButtonClick = this.onButtonClick.bind(this)
	}

	onButtonClick(event) {
		var id = event.target.dataset.devid
		console.log(id)

		this.setState({
			current_dev: id,
		})
	}

	renderDeviceList() {
		let devices = this.props.current_user.device_set

		if (devices.length > 0) {
			return devices.map(function(device) {
				let dev_list_key = "dev_list_".concat(device.toString());

				return (
					<div className="mb-lg-2" key={dev_list_key}>
						<button type="button" className="btn font-weight-bold lh-bl-bg-color btn-block" data-devid={device} onClick={this.onButtonClick}>
							<img src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center">{this.props.current_user.username}@dev{device}</span>
						</button>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="row ml-0">
				<div className="col-4 mx-0 px-0">
					<div className="card wh-bl-bg-color no-pad-h border card-t-detail">
						<div className="card-header no-pad-h card-f-header">
							Devices
						</div>
						<ul className="list-group list-group-flush">
							{this.renderDeviceList()}
						</ul>
					</div>
				</div>
				<div className="col-8 mx-0 px-0">
					<Log dev_id={this.state.current_dev} />
				</div>
			</div>
		)
	}

}