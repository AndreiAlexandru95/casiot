import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'
import LineChart from '../dashboard/LineChart.jsx'
import BarChart from '../dashboard/BarChart.jsx'
import {CSVLink, CSVDownload} from 'react-csv'
import * as d3 from 'd3'

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
		this.getChartData()
		this.getLogData()
		this.setState({
			socket: this.refs.socket
		});
	}

	handleData(data) {
		console.log("triggered")
		let result = JSON.parse(data)
		this.getDeviceDetails()
		this.getChartData()
		this.getLogData()
	}

	sendSocketMessage(message) {
		const socket = this.state.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	render() {
		return (
			<div className="row d-size m-0">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<Panel sendSocketMessage={this.sendSocketMessage} device={this.state.device} />
				<div className="col-6 p-0">
					<div className="card border p-0 m-height bg-light">
						<div className="card-header card-head-font d-flex justify-content-between h-height p-2">
							<div className="p-2">
								Chart
							</div>
							{this.state.chart.length > 0 &&
								<CSVLink data={this.state.chart} className="btn btn-block btn-primary b-t-font dw-width">
									<img src="../../static/third_party/open-iconic-master/svg/data-transfer-download.svg" alt="+"/> <span className="text-center">Download</span>
								</CSVLink>
							}
						</div>
						<div className="card-body p-0 b-l-height">
							<Chart device={this.state.device}/>
						</div>
					</div>
					<div className="card border p-0 l-height bg-light">
						<div className="card-header card-head-font d-flex justify-content-between h-height p-2">
							<div className="p-2">
								Log
							</div>
							{this.state.d_logs.length > 0 &&
								<CSVLink data={this.state.d_logs} className="btn btn-block btn-primary b-t-font dw-width">
									<img src="../../static/third_party/open-iconic-master/svg/data-transfer-download.svg" alt="+"/> <span className="text-center">Download</span>
								</CSVLink>
							}
						</div>
						<div className="card-body add-scroll py-1 b-height pl-1">
							<Log device={this.state.device}/>
						</div>
					</div>
				</div>
				<div className="col-3 p-0 card border info-bg-color">
					<div className="card-header card-head-font">
						Information
					</div>
					<div className="card-body add-scroll">
						<div>
							<p className="inf-title">Details</p>
							<p className="inf-text">Here you can see all the recorded data about the device in real time.</p>
							<p className="inf-title">Actions</p>
							<p className="inf-text">A list of available commands that you can send to interact with the device.</p>
							<p className="inf-subtext">Note: Some actions can require additional data to be provided. Make sure you fill in any required fields that pop up when clicking an action.</p>
							<p className="inf-title">Chart</p>
							<p className="inf-text">By default, Latest is selected.</p>
							<p className="inf-subtext">Note: Go to Charts to compare timelapses between devices.</p>
							<p className="inf-subtitle">Latest</p>
							<p className="inf-text">Display last 100 value changes.</p>
							<p className="inf-subtitle">Average</p>
							<p className="inf-text">Displays averages per hour for the last 24 hours.</p>
							<p className="inf-text">Displays averages per day for the last 7 days.</p>
							<p className="inf-subtext">Note: For a full analysis of the target data provided by the device. Download the complete value & date set as *.csv.</p>
							<p className="inf-title">Log</p>
							<p className="inf-text">Last 50 log entries are displayed here at all time. Its main purpose is to supervise the interactions with the device and offer the user real time feedback from them.</p>
							<p className="inf-subtext">Note: For a full analysis of the logs. Download the complete log as *.csv.</p>
						</div>
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
		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("%d/%m/%Y %H:%M:%S")
		if (this.props.device!=null) {
			let l_date = parseRealDate(this.props.device.modified.substring(0, this.props.device.modified.length-4))

			return (
				<div className="col-3 p-0">
					<div className="card border lblue-bg-color p-0 m-height">
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
								{dateFormat(l_date)}
							</p>
							<p className="b-t-font m-p">
								Value
							</p>
							<p className="t-font pl-2 m-p">
								{this.props.device.value}
							</p>
						</div>
					</div>
					<div className="card border lblue-bg-color p-0 l-height">
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
		this.state = {
			check_d: true,
			check_c: false,
			check_ew: false,
			logs: [],
			ewlogs: [],
			socket: 'ws://'+window.location.host+'/devices/',
		}
	}

	getDeviceLogs(props) {
		if (props.device) {
			var dev_id = props.device.id;
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-log50/'+dev_id+'/?format=json', function(result) {
				this.setState({
					logs: result
				});
			}.bind(this))
		}
	}

	getDeviceEW(props) {
		if (props.device) {
			var dev_id = props.device.id;
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-ewlog/'+dev_id+'/?format=json', function(result) {
				this.setState({
					ewlogs: result
				});
			}.bind(this))
		}
	}

	handleDBGChange() {
		this.setState({
			check_d: true,
			check_c: false,
			check_ew: false,
		})
	}


	handleCMDChange() {
		this.setState({
			check_d: false,
			check_c: true,
			check_ew: false,
		})
	}

	handleEWChange() {
		this.setState({
			check_d: false,
			check_c: false,
			check_ew: true,
		})
	}

	componentDidMount() {
		this.getDeviceLogs(this.props)
		this.getDeviceEW(this.props)
	}

	handleData(data) {
		this.getDeviceLogs(this.props)
		this.getDeviceEW(this.props)
	}

	componentWillReceiveProps(nextProps) {
		this.getDeviceLogs(nextProps)
		this.getDeviceEW(nextProps)
	}

	renderLog() {
		let logs
		if (this.state.check_ew) {
			logs = this.state.ewlogs
		} else {
			logs = this.state.logs
		}

		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("(%d/%m/%Y %H:%M:%S)")

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString())

				let log_date = parseRealDate(log.date.substring(0, log.date.length-4))
				let log_type = log.type
				let log_text = log.text

				if (this.state.check_c && log_type=='DBG') {
					return
				}
				switch (log_type) {
					case 'INF':
						return (<p className="log-font inf-log-color" key={log_key}>{dateFormat(log_date)}: {log_text}</p>)
					case 'WAR':
						return (<p className="log-font war-log-color" key={log_key}>{dateFormat(log_date)}: {log_text}</p>)
					case 'DBG':
						return (<p className="log-font dbg-log-color" key={log_key}>{dateFormat(log_date)}: {log_text}</p>)
					default:
						return (<p className="log-font err-log-color" key={log_key}>{dateFormat(log_date)}: {log_text}</p>)
				}

			}, this)
		} else {
			return (
				<p className="info-font">No Logs to show...</p>
			)
		}
	}

	render() {
		if (this.props.device) {
			return (
				<div>
					<Websocket ref="socket" url={this.state.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
					<div>
						<form className="d-flex justify-content-center">
							<div className="px-4">
								Modes: 
							</div>
							<div className="radio px-2">
								<label>
									<input type="radio" value="debug" checked={this.state.check_d} onChange={this.handleDBGChange.bind(this)}/>
									Debug
								</label>
							</div>
							<div className="radio px-2">
								<label>
									<input type="radio" value="daily" checked={this.state.check_c} onChange={this.handleCMDChange.bind(this)}/>
									Command
								</label>
							</div>
							<div className="radio px-2">
								<label>
									<input type="radio" value="daily" checked={this.state.check_ew} onChange={this.handleEWChange.bind(this)}/>
									Warnings&Errors (<span className="war-log-color">{this.props.device.number_of_war}</span>&<span className="err-log-color">{this.props.device.number_of_err}</span>)
								</label>
							</div>
						</form>
					</div>
					<hr className="my-1"/>
					{this.renderLog()}
				</div>
			)	
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
