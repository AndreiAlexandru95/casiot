import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Chart from './Chart.jsx'

export default class ChartList extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			'dev_id': 0
		}
	}

	handleButton(device_id, event) {
		this.setState({
			dev_id: device_id
		})
	}

	renderDeviceList() {
		let devices = this.props.current_user.device_set

		if (devices.length > 0) {
			return devices.map(function(device_id) {
				let key = "dev_".concat(device_id.toString())
				let handleButton = this.handleButton.bind(this, device_id)
				return(
					<button type="button" className="btn lg-bg-color btn-block border m-0" value={device_id} key={key} onClick={handleButton}>
						<img src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center">{this.props.current_user.username}@dev{device_id}</span>
					</button>
				)				
			}, this)
		} else {
			return(
				<p className="info-font">No Devices Available for this Account</p>
			)
		}
	}

	render() {
		return (
			<div className="row">
				<div className="col-4 pr-0">
					<div className="card wh-bl-bg-color">
						<div className="card-header card-h-font">
							Devices
						</div>
						{this.renderDeviceList()}
					</div>
				</div>
				<Chart dev_id={this.state.dev_id} socket={this.props.socket}/>
			</div>
		)
	}

}