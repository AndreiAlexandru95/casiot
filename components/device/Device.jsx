import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'
import LineChart from '../dashboard/LineChart.jsx'
import BarChart from '../dashboard/BarChart.jsx'
import {CSVLink, CSVDownload} from 'react-csv'

export default class Device extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			device: null,
			th_max: 0,
			th_min: 0,
			logs: [],
			socket: null,
			chart: [],
			d_logs: [],
		}

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
	}

	getChartData() {
		var dev_id = $("#dev_ret").data("pk")
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chart/'+dev_id+'/?format=json', function(result) {
			this.setState({
				chart: result,
			});
		}.bind(this))
	}

	getDeviceDetails() {
		var dev_id = $("#dev_ret").data("pk")
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

	getLogData() {
		var dev_id = $("#dev_ret").data("pk");
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device-log/'+dev_id+'/?format=json', function(result) {
			this.setState({
				d_logs: result
			});
		}.bind(this))
	}

	componentDidMount() {
		this.getDeviceDetails()
		this.getDeviceLogs()
		this.getChartData()
		this.getLogData()
		this.setState({
			socket: this.refs.socket
		});
	}

	handleData(data) {
		let result = JSON.parse(data)
		this.getDeviceDetails()
		this.getDeviceLogs()
		this.getChartData()
		this.getLogData()
	}

	sendSocketMessage(message) {
		console.log(this)
		const socket = this.state.socket
		console.log(socket)
		socket.state.ws.send(JSON.stringify(message))
	}

	render() {
		console.log(this.state.chart)
		console.log(this.state.d_logs)
		return (
			<div className="row d-size m-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Panel sendSocketMessage={this.sendSocketMessage} device={this.state.device} />
				<div className="col-6 p-0">
					<div className="card border cb-bg-color p-0 m-height">
						<div className="card-header card-head-font d-flex justify-content-between h-height p-2">
							<div className="p-2">
								Chart
							</div>
							{this.state.chart.length > 0 &&
								<CSVLink data={this.state.chart} className="btn btn-block btn-success b-t-font dw-width">
									<img src="../../static/third_party/open-iconic-master/svg/data-transfer-download.svg" alt="+"/> <span className="text-center">Download</span>
								</CSVLink>
							}
						</div>
						<div className="card-body p-0 b-l-height">
							<Chart device={this.state.device}/>
						</div>
					</div>
					<div className="card border gy-bg-color p-0 l-height">
						<div className="card-header card-head-font d-flex justify-content-between h-height p-2">
							<div className="p-2">
								Log
							</div>
							{this.state.d_logs.length > 0 &&
								<CSVLink data={this.state.d_logs} className="btn btn-block btn-success b-t-font dw-width">
									<img src="../../static/third_party/open-iconic-master/svg/data-transfer-download.svg" alt="+"/> <span className="text-center">Download</span>
								</CSVLink>
							}
						</div>
						<div className="card-body add-scroll py-1 b-height">
							<Log logs={this.state.logs}/>
						</div>
					</div>
				</div>
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

class Panel extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			open: false,
			cmd: 'cmd-no',
			dev_name: '',
			dev_info: '',
			dev_timer: 0,
			dev_th_min: 0,
			dev_th_max: 0,
		}

		this.populatePanel.bind(this);
	}

	componentDidMount() {
		this.populatePanel()
	}

	componentWillReceiveProps(nextProps) {
		this.populatePanel(nextProps)
	}

	populatePanel(nextProps) {
		let device = null
		if (nextProps) {
			device = nextProps.device
		} else {
			device=this.props.device
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
			return(
				<div className="border-bottom" key={cmd_key}>
					<button type="button" data-cmd={cmd_key} className="btn btn-block b-t-font m-bg-color" onClick={this.openModal.bind(this)}>
						<span data-cmd={cmd_key} className="text-center">{cmd}</span>
					</button>
				</div>
			)
		}, this)
	}

	openModal(event) {
		let cmd = event.target.dataset.cmd

		switch(cmd) {
			case 'cmd-ci':
				break;
			case 'cmd-ti':
				break;
			case 'cmd-th':
				break;
			case 'cmd-LED':
				this.props.sendSocketMessage({
					command: cmd,
					id: this.props.device.id
				})
				break;
			defaul:
				cmd='cmd-no'
		}

		this.setState({
			open: true,
			cmd: cmd,
		})
	}

	closeModal(event) {
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
		if (this.props.device!=null) {
			return (
				<div className="col-3 p-0">
					<div className="card border lg-bg-color p-0 m-height">
						<div className="card-header card-head-font">
							Details
						</div>
						<div className="card-body p-2">
							<p className="b-t-font m-p">
								Name & ID
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.name} {this.props.device.id}
							</p>
							<p className="b-t-font m-p">
								Description
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.info}
							</p>
							<p className="b-t-font m-p">
								Address
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.ip_addr}
							</p>
							<p className="b-t-font m-p">
								Timer
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.timer}
							</p>
							<p className="b-t-font m-p">
								Threshold
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.th_min} to {this.props.device.th_max}
							</p>
							<p className="b-t-font m-p">
								Last Update
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.modified}
							</p>
							<p className="b-t-font m-p">
								Value
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.value}
							</p>
						</div>
					</div>
					<div className="card border g-bg-color p-0 l-height">
						<div className="card-header card-head-font">
							Actions
						</div>
						<div className="card-body p-0">
							<div className="border-bottom" key="cmd-ci">
								<button type="button" data-cmd="cmd-ci" className="btn btn-block b-t-font m-bg-color" onClick={this.openModal.bind(this)}>
									<span data-cmd="cmd-ci" className="text-center">Change Information</span>
								</button>
							</div>
							<div className="border-bottom" key="cmd-ti">
								<button type="button" data-cmd="cmd-ti" className="btn btn-block b-t-font m-bg-color" onClick={this.openModal.bind(this)}>
									<span data-cmd="cmd-ti" className="text-center">Change Timer</span>
								</button>
							</div>
							<div className="border-bottom" key="cmd-th">
								<button type="button" data-cmd="cmd-th" className="btn btn-block b-t-font m-bg-color" onClick={this.openModal.bind(this)}>
									<span data-cmd="cmd-th" className="text-center">Change Threshold</span>
								</button>
							</div>
							{this.renderCommands()}
						</div>
						<Modal open={this.state.open} onClose={this.closeModal.bind(this)} little>
							{this.state.cmd ==  'cmd-no' &&
								<h4 className="p-4">
									Command Unsuported. please use different command!
								</h4>
							}
							{this.state.cmd ==  'cmd-ci' &&
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
							{this.state.cmd ==  'cmd-ti' &&
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
			return(
				<p className="info-font">Loading ...</p>
			)
		}
	}
}

class Log extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		let logs = this.props.logs

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString())
				return (
					<p className="log-font" key={log_key}>{log.type}|{log.date}//:{log.text}</p>
				)
			}, this)
		} else {
			return (
				<p className="info-font">Loading...</p>
			)
		}
	}
}

class Chart extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			chart_sw: 0,
			disable_line: true,
			disable_bar: false,
		}
	}

	handleLineClick() {
		this.setState({
			chart_sw: 0	,
			disable_line: true,
			disable_bar: false,
		})
	}

	handleBarClick() {
		this.setState({
			chart_sw: 1,
			disable_line: false,
			disable_bar: true,
		})
	}

	render() {
		return(
			<div>
				<div className="chart-tabs">
					<div className="m-0 row chart-tabs">
						<div className="col-6 p-0">
							<button disabled={this.state.disable_line} className="btn btn-block b-tab-font chart-tabs p-0" onClick={this.handleLineClick.bind(this)}>
								Latest
							</button>
						</div>
						<div className="col-6 p-0">
							<button disabled={this.state.disable_bar} className="btn btn-block b-tab-font chart-tabs p-0" onClick={this.handleBarClick.bind(this)}>
								Average
							</button>
						</div>
					</div>
				</div>
				{this.state.chart_sw == 0 && this.props.device &&
					<LineChart dev_id={this.props.device.id}/>
				}
				{this.state.chart_sw == 1 && this.props.device &&
					<BarChart dev_id={this.props.device.id}/>
				}
			</div>
		)
	}
}

Device.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string
};

Panel.propTypes = {
	device: PropTypes.object
};

Log.propTypes = {
	logs: PropTypes.array
}
