import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import LineChart from '../dashboard/LineChart.jsx'


export default class DeviceView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			device: null,
			logs: [],
			chart_data: [], 
		};
		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	getDeviceDetails() {
		var dev_id = $("#dev_ret").data("pk");
		
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device/'+dev_id+'/?format=json', function(result) {
			this.setState({
				device: result
			});
		}.bind(this))
	}

	getDeviceLogs() {
		var dev_id = $("#dev_ret").data("pk");
		
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device-log50/'+dev_id+'/?format=json', function(result) {
			this.setState({
				logs: result
			});
		}.bind(this))
	}

	getDeviceChart() {
		var dev_id = $("#dev_ret").data("pk");
		
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chart100/'+dev_id+'/?format=json', function(result) {
			this.setState({
				chart_data: result
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceDetails();
		this.getDeviceLogs();
		this.getDeviceChart();
	}

	sendSocketMessage(message){
		const socket = this.refs.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	handleData(data) {
		let result = JSON.parse(data);
		this.getDeviceDetails();
		this.getDeviceLogs();
		this.getDeviceChart();
	}

	render() {
		return (
			<div className="row col-full ml-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Details device={this.state.device}/>
				<div className="col-center wh-bl-bg-color">
					<Chart chart_data={this.state.chart_data}/>
					<Log logs={this.state.logs}/>
				</div>
			</div>
		)
	}
}

class Details extends React.Component {
	constructor(props) {
		super(props)
	}

	renderCommands() {
		return this.props.device.commands.map(function(cmd) {
			let cmd_key = "cmd-".concat(cmd);

			return (
				<div className="mb-lg-2" key={cmd_key}>
					<button type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
						<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
						<span> {cmd}</span>
					</button>
				</div>
			)
		}, this)
	}

	render() {
		if (this.props.device!=null){
			return (
				<div className="col-left lg-bg-color">
					<div className="card lg-bg-color no-pad-h border card-t-detail half-height mx-0">
						<div className="card-header no-pad-h card-f-header">
							Device Details
						</div>
						<div className="card-body no-pad-h pt-lg-2">
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Name & ID:</span>
								<span className="text-dark">{this.props.device.name} {this.props.device.id}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Description:</span>
								<span className="text-dark">{this.props.device.info}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Address:</span>
								<span className="text-dark">{this.props.device.ip_addr}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Timer:</span>
								<span className="text-dark">{this.props.device.timer}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Threshold:</span>
								<span className="text-dark">{this.props.device.th_min} to {this.props.device.th_max}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Last Update:</span>
								<span className="text-dark">{this.props.device.modified}</span>
							</p>
							<p className="d-flex justify-content-between mx-md-3">
								<span className="text-dark font-weight-bold">Current value:</span>
								<span className="text-dark">{this.props.device.value}</span>
							</p>
						</div>
					</div>
					<div className="card no-pad-h border card-t-detail dg-bg-color half-height mx-0">
						<div className="card-header no-pad-h card-f-header">
							Actions
						</div>
						<ul className="list-group list-group-flush">
							<div className="mb-lg-2" key="cmd-ci">
								<button type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block align-self-start">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span> Change Information</span>
								</button>
							</div>
							<div className="mb-lg-2" key="cmd-ti">
								<button type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span> Change Timer</span>
								</button>
							</div>
							<div className="mb-lg-2" key="cmd-th">
								<button type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span> Change Threshold</span>
								</button>
							</div>
							{this.renderCommands()}
						</ul>
					</div>
				</div>
			)
		} else {
			return (
				<p>Loading...</p>
			)
		}
	}
}

class Chart extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			width: 0,
			height: 0,
			margin: {
				'left': 50,
				'right': 20,
				'bottom': 30,
				'top': 20,
			},
		};

		this.updateDimensions = this.updateDimensions.bind(this);
	}

	updateDimensions() {

		if (this.myInput) {
			this.setState({
				width: this.myInput.offsetWidth-10,
				height: this.myInput.offsetHeight-10,
			})
		}
	}

	componentDidMount() {
		this.updateDimensions()
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	renderChart() {
		return <LineChart data={this.props.chart_data} width={this.state.width} height={this.state.height} margin={this.state.margin} />
	}

	render() {
		return (
			<div className="card wh-bl-bg-color border card-t-detail half-height mx-0">
				<div className="card-header no-pad-h card-f-header">
					Chart
				</div>
				<div id="graphic" className="card-body no-pad-h card wh-bl-bg-color" ref={input => {this.myInput = input}}>{this.renderChart()}</div>
			</div>
		)
	}
}

class Log extends React.Component {
	constructor(props) {
		super(props)
	}

	renderLog() {
		let logs = this.props.logs

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString());
				return (
					<li className="list-group-item lh-bl-bg-color" key={log_key}>
						{log.type} {log.date} : {log.text}
					</li>
				)
			}, this)
		} else {
			return (
				<li className="list-group-item">
					Loading ...
				</li>
			)
		}
	}

	render() {
		return (
			<div className="card border card-t-detail half-height lh-bl-bg-color mx-0">
				<div className="card-header no-pad-h card-f-header">
					Log
				</div>
				<ul className="list-group list-group-flush">
					{this.renderLog()}
				</ul>
			</div>
		)
	}
}

DeviceView.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};

Details.propTypes = {
	device: PropTypes.object
};

Log.propTypes = {
	logs: PropTypes.array
};

Chart.propTypes = {
	chart_data: PropTypes.array
}