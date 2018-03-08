import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import LineChart from '../dashboard/LineChart.jsx'
import Modal from 'react-responsive-modal'


export default class DeviceView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			device: null,
			logs: [],
			chart_data: [],
			th_max: 0,
			th_min: 0, 
		};
		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	getDeviceDetails() {
		var dev_id = $("#dev_ret").data("pk");
		
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device/'+dev_id+'/?format=json', function(result) {
			this.setState({
				device: result,
				th_max: result.th_max,
				th_min: result.th_min,
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
				<Details sendSocketMessage={this.sendSocketMessage} device={this.state.device}/>
				<div className="col-center wh-bl-bg-color">
					<Chart chart_data={this.state.chart_data} th_max={this.state.th_max} th_min={this.state.th_min}/>
					<Log logs={this.state.logs}/>
				</div>
			</div>
		)
	}
}

class Details extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			open: false,
			cmd : 'cmd-no',
			dev_name: '',
			dev_info: '',
			dev_timer: 0,
			dev_th_min: 0,
			dev_th_max: 0,
		}

		this.populateComponent.bind(this);
	}

	componentDidMount() {
		this.populateComponent();

	}

	componentWillReceiveProps(nextProps) {
		this.populateComponent(nextProps)
	}

	populateComponent(newProps) {
		let device = this.props.device
		if (newProps) {
			device = newProps.device
		}

		if (device) {
			this.setState({
				dev_name: device.name,
				dev_info: device.info,
				dev_timer: device.timer,
				dev_th_min: device.th_min,
				dev_th_max: device.th_max,
			})
		}
	}

	renderCommands() {
		return this.props.device.commands.map(function(cmd) {
			let cmd_key = "cmd-".concat(cmd);

			return (
				<div className="mb-lg-2" key={cmd_key}>
					<button data-cmd={cmd_key} onClick={this.onOpenModal.bind(this)} type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
						<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
						<span data-cmd={cmd_key}> {cmd}</span>
					</button>
				</div>
			)
		}, this)
	}

	onOpenModal(event) {
		let cmd = event.nativeEvent.target.dataset.cmd
		console.log(cmd)

		switch (cmd) {
			case 'cmd-info':
				break;
			case 'cmd-timer':
				break;
			case 'cmd-th':
				break;
			case 'cmd-LED':
				this.props.sendSocketMessage({
					command: cmd,
					id: this.props.device.id,
				})
				break;
			default:
				cmd = 'cmd-no'
		}

		this.setState({
			open: true,
			cmd: cmd,
		})
	}

	onCloseModal(event) {
		this.setState({
			open: false,
		})
	}

	handleChangeInfo(event) {
		this.props.sendSocketMessage({
			command: this.state.cmd,
			name: this.state.dev_name,
			info: this.state.dev_info,
			id: this.props.device.id,
		})
	}

	handleChangeTimer(event) {
		this.props.sendSocketMessage({
			command: this.state.cmd,
			timer: this.state.dev_timer,
			id: this.props.device.id,
		})
	}

	handleChangeTh(event) {
		this.props.sendSocketMessage({
			command: this.state.cmd,
			th_min: this.state.dev_th_min,
			th_max: this.state.dev_th_max,
			id: this.props.device.id,
		})
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
								<button data-cmd="cmd-info" onClick={this.onOpenModal.bind(this)} type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block align-self-start">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span data-cmd="cmd-info" > Change Information</span>
								</button>
							</div>
							<div className="mb-lg-2" key="cmd-ti">
								<button data-cmd="cmd-timer" onClick={this.onOpenModal.bind(this)} type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span data-cmd="cmd-timer" > Change Timer</span>
								</button>
							</div>
							<div className="mb-lg-2" key="cmd-th">
								<button data-cmd="cmd-th" onClick={this.onOpenModal.bind(this)} type="button" className="btn t-s p-t-color font-weight-bold dg-bg-color btn-block">
									<img src="../../static/third_party/open-iconic-master/svg/chevron-right.svg" alt=">"/>
									<span data-cmd="cmd-th" > Change Threshold</span>
								</button>
							</div>
							{this.renderCommands()}
						</ul>
						<Modal open={this.state.open} onClose={this.onCloseModal.bind(this)} little>
							{this.state.cmd ==  'cmd-no' &&
								<h4 className="p-4">
									Command Unsuported. please use different command!
								</h4>
							}
							{this.state.cmd ==  'cmd-info' &&
								<div className="p-4">
									<h4>Change Information</h4>
									<hr/>
									<form onSubmit={this.handleChangeInfo.bind(this)}>
										<label>
											Name: 
											<input type="text" value={this.state.dev_name} onChange={function(event) {
												this.setState({
													dev_name: event.target.value
												})
											}.bind(this)} />
										</label>
										<label>
											Info: 
											<input type="text" value={this.state.dev_info} onChange={function(event) {
												this.setState({
													dev_info: event.target.value
												})
											}.bind(this)} />
										</label>
										<input type="submit" value="Submit" />
									</form>
								</div>
							}
							{this.state.cmd ==  'cmd-timer' &&
								<div className="p-4">
									<h4>Change Timer</h4>
									<hr/>
									<form onSubmit={this.handleChangeTimer.bind(this)}>
										<label>
											Timer(s): 
											<input type="text" value={this.state.dev_timer} onChange={function(event) {
												this.setState({
													dev_timer: event.target.value
												})
											}.bind(this)} />
										</label>
										<input type="submit" value="Submit" />
									</form>
								</div>
							}
							{this.state.cmd ==  'cmd-th' &&
								<div className="p-4">
									<h4>Change Threshold</h4>
									<hr/>
									<form onSubmit={this.handleChangeTh.bind(this)}>
										<label>
											Minimum: 
											<input type="text" value={this.state.dev_th_min} onChange={function(event) {
												this.setState({
													dev_th_min: event.target.value
												})
											}.bind(this)} />
										</label>
										<label>
											Maximum: 
											<input type="text" value={this.state.dev_th_max} onChange={function(event) {
												this.setState({
													dev_th_max: event.target.value
												})
											}.bind(this)} />
										</label>
										<input type="submit" value="Submit" />
									</form>
								</div>
							}
							{this.state.cmd ==  'cmd-LED' &&
								<div className="p-4">
									<h4>
										Command 'LED' sent.
									</h4>
								</div>
							}
						</Modal>
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
		return <LineChart data={this.props.chart_data} width={this.state.width} height={this.state.height} margin={this.state.margin} th_max={this.props.th_max} th_min={this.props.th_min}/>
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