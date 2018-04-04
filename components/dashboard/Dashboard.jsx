import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'
import {CSVLink, CSVDownload} from 'react-csv'
import * as d3 from 'd3'
import AdvMultiLineChart from './AdvMultiLineChart.jsx'
import LineChart from './LineChart.jsx'
import BarChart from './BarChart.jsx'

export default class Dashboard extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			devices_to_show: '',
			socket: null,
			open: false,
			dev_key: '',
		}

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
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
		this.sendSocketMessage({
			command: 'cmd-sn',
			dev_key: this.state.dev_key,
			user: this.props.current_user.username,
		})
	}

	flushDBClick(event) {
		this.sendSocketMessage({
			command: 'cmd-fl_db'
		})
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
		})
	}

	handleData(data) {
		let result = JSON.parse(data)
		if (result.text == "received an updated dev_list"){
			this.getDeviceList()
		}
	}

	handleDeviceClick(device_id, event) {
		let device = device_id.toString().concat("-")
		let compare_dev = this.state.devices_to_show
		let index = compare_dev.indexOf(device)
		if (index == 0) {
			compare_dev = compare_dev.substr(2)
		} else if(index == compare_dev.length-2 && compare_dev.length != 0) {
			compare_dev = compare_dev.slice(0, -2)
		} else if(index > -1) {
			compare_dev.replace(device, '')
		} else {
			compare_dev = compare_dev.concat(device)
		}
		this.setState({
			devices_to_show: compare_dev,
		})
	}

	renderDeviceList() {
		let devices = this.state.device_list
		let act_dev = this.state.devices_to_show.split("-")
		let username = this.props.current_user.username

		if (devices.length > 0){
			return devices.map(function(device) {
				let key = "dev-li-".concat(device.id.toString())
				let device_id = device.id
				let handleDeviceClick = this.handleDeviceClick.bind(this, device_id)
				let activeDev = act_dev.indexOf(device_id.toString())
				let activate = false
				if (activeDev >= 0) {
					activate = true
				}
				return (
					<li className={activate ? 'list-group-item active p-1 text-center dev-li cur-point': 'list-group-item p-1 text-center dev-li cur-point'} onDoubleClick={handleDeviceClick} key={key}>
						<img className="cur-point" src="../../static/third_party/open-iconic-master/svg/eye.svg" alt="+"/> <span className="text-center cur-point">{username}@dev{device.id}</span>			
					</li>
				)
			}, this)
		}
	}

	sendSocketMessage(message) {
		const socket = this.state.socket
		socket.state.ws.send(JSON.stringify(message))
	}

	render() {
		return (
			<div className="row">
				<Websocket ref="socket" url={this.props.device_socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="col-md-10 row m-0 p-0">
					<div className="col-md-9 row m-0 p-0">
						<Chart devices={this.state.devices_to_show} />
						<div className="col-md-12 card dash-panel-height-sm p-0">
							<Log devices={this.state.devices_to_show} />
						</div>
					</div>
					<div className="col-md-3 row m-0 p-0">
						<div className="col-md-12 card dash-panel-height-lg p-0">
							<Details devices={this.state.devices_to_show}/>
						</div>
						<div className="col-md-12 card dash-panel-height-sm p-0">
							<Commands devices={this.state.devices_to_show} current_user={this.props.current_user} sendSocketMessage={this.sendSocketMessage}/>
						</div>
					</div>
				</div>
				<nav className="col-md-2 d-none d-md-block sidebar p-0">
					<div className="card sidebar-sticky bg-light">
						<div className="card-header card-head-font dev-bg-color d-flex justify-content-between">
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
						<div className="card-body p-0">
							<ul className="list-group">
								{this.renderDeviceList()}
							</ul>
						</div>
					</div>
				</nav>
			</div>
		)
	}
}

class Log extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			device_list: [],
			combine: false,
		}
	}

	getDeviceList(props) {
		let devices = props.devices
		devices = devices.slice(0, -1)

		if (devices != '') {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-details/'+devices+'/?format=json', function(result) {
				this.setState({
					device_list: result,
				});
			}.bind(this))
		} else {
			this.setState({
				device_list: [],
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.devices != nextProps.devices) {
			this.getDeviceList(nextProps)
		}
	}

	componentDidMount() {
		this.getDeviceList(this.props)
	}

	handleCombineChange(event) {
		this.setState({
			combine: !this.state.combine
		})
	}

	renderLogTabs() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-log-tab-".concat(device.id.toString())
				let target_id = "nav-log-panel-".concat(device.id.toString())
				let key = "log-tab-key-".concat(device.id.toString())
				return (
					<a className={i == 0 ? 'nav-item nav-link db-t-font active': 'nav-item nav-link db-t-font'} key={key} id={id} data-toggle="tab" href={"#".concat(target_id)} role="tab" aria-controls={target_id} aria-selected="false">dev{device.id}</a>
				)
			}, this)
		}
	}

	renderLogDetails() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-log-panel-".concat(device.id.toString())
				let target_id = "nav-log-tab-".concat(device.id.toString())
				let key = "log-key-".concat(device.id.toString())
				return (
					<div className={i == 0 ? 'tab-pane fade show active':'tab-pane fade'} key={key}  id={id} role="tabpanel" aria-labelledby={target_id}>
						<LogTab device={device}/>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-md-12 card dash-panel-height-lg p-0">
				<div className="card-header">
					Log
					<span className="pl-4">
						<input type="checkbox" checked={this.state.combine} onChange={this.handleCombineChange.bind(this)}/>
						<span>
							Combine
						</span>
					</span>
				</div>
				<div className="card-body p-0 m-0">
					{this.state.combine &&
						<MultiLog devices={this.props.devices}/>
					}
					{!this.state.combine &&
						<div>
							<nav>
								<div className="nav nav-tabs add-scroll-x" id="nav-chart-tab" role="tablist">
									{this.renderLogTabs()}
								</div>
							</nav>
							<div className="tab-content add-scroll-y downtab" id="nav-chart-tabContent">
								{this.renderLogDetails()}
							</div>
						</div>
					}
				</div>
			</div>
		)
	}
}

class MultiLog extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			logs: [],
			socket: 'ws://'+window.location.host+'/devices/',
			check_d: true,
			check_c: false,
		}
	}

	getDevicesLogs(props) {
		var dev_id = ''
		if (props.devices) {
			dev_id = props.devices.slice(0, -1)
		}

		if (dev_id != '') {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-logs/'+dev_id+'/?format=json', function(result) {
				this.setState({
					logs: result,
				})
			}.bind(this))
		}
	}

	componentDidMount() {
		this.getDevicesLogs(this.props)
	}

	componentWillReceiveProps(nextProps) {
		this.getDevicesLogs(nextProps)
	}

	handleData(data) {
		this.getDevicesLogs(this.props)
	}

	handleDBGChange() {
		this.setState({
			check_d: true,
			check_c: false,
		})
	}


	handleCMDChange() {
		this.setState({
			check_d: false,
			check_c: true,
		})
	}

	renderLogs() {
		let logs = this.state.logs

		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("(%d/%m/%Y %H:%M:%S)")

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString())

				let log_dev = "dev".concat(log.device_id.toString())
				let log_date = parseRealDate(log.date.substring(0, log.date.length-4))
				let log_type = log.type
				let log_text = log.text

				if (this.state.check_c && log_type=='DBG') {
					return
				}
				switch (log_type) {
					case 'INF':
						return (<p className="log-font inf-log-color" key={log_key}>{log_dev}-{dateFormat(log_date)}: {log_text}</p>)
					case 'WAR':
						return (<p className="log-font war-log-color" key={log_key}>{log_dev}-{dateFormat(log_date)}: {log_text}</p>)
					case 'DBG':
						return (<p className="log-font dbg-log-color" key={log_key}>{log_dev}-{dateFormat(log_date)}: {log_text}</p>)
					default:
						return (<p className="log-font err-log-color" key={log_key}>{log_dev}-{dateFormat(log_date)}: {log_text}</p>)
				}

			}, this)
		}
	}

	render() {
		if (this.state.logs.length > 0) {
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
						</form>
					</div>
					<div className="l-downtab add-scroll-y">
						{this.renderLogs()}
					</div>
				</div>
			)	
		} else {
			return (
				<p className="info-font">Loading...</p>
			)
		}
	}
}

class LogTab extends React.PureComponent {
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

class Chart extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			width: 400,
			height: 400,
			combine: false,
			device_list: [],
		}

		this.updateDimensions = this.updateDimensions.bind(this)
	}

	updateDimensions() {
		if (this.myInput) {
			this.setState({
				width: this.myInput.clientWidth,
				height: this.myInput.clientHeight-65,
			})
		}
	}

	getDeviceList(props) {
		let devices = props.devices
		devices = devices.slice(0, -1)

		if (devices != '') {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-details/'+devices+'/?format=json', function(result) {
				this.setState({
					device_list: result,
				});
			}.bind(this))
		} else {
			this.setState({
				device_list: [],
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.devices != nextProps.devices) {
			this.getDeviceList(nextProps)
		}
	}

	componentDidMount() {
		this.updateDimensions()
		window.addEventListener("resize", this.updateDimensions)
		this.getDeviceList(this.props)
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions)
	}

	handleCombineChange(event) {
		this.setState({
			combine: !this.state.combine
		})
	}

	renderChartTabs() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-chart-tab-".concat(device.id.toString())
				let target_id = "nav-chart-panel-".concat(device.id.toString())
				let key = "chart-tab-key-".concat(device.id.toString())
				return (
					<a className={i == 0 ? 'nav-item nav-link db-t-font active': 'nav-item nav-link db-t-font'} key={key} id={id} data-toggle="tab" href={"#".concat(target_id)} role="tab" aria-controls={target_id} aria-selected="false">dev{device.id}</a>
				)
			}, this)
		}
	}

	renderChartDetails() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-chart-panel-".concat(device.id.toString())
				let target_id = "nav-chart-tab-".concat(device.id.toString())
				let key = "chart-key-".concat(device.id.toString())
				return (
					<div className={i == 0 ? 'tab-pane fade show active':'tab-pane fade'} key={key}  id={id} role="tabpanel" aria-labelledby={target_id}>
						<TabChart device={device} width={this.state.width} height={this.state.height}/>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="col-md-12 card dash-panel-height-lg p-0">
				<div className="card-header">
					Chart
					<span className="pl-4">
						<input type="checkbox" checked={this.state.combine} onChange={this.handleCombineChange.bind(this)}/>
						<span>
							Combine
						</span>
					</span>
				</div>
				<div className="card-body p-0 m-0" ref={input => {this.myInput = input}}>
					{this.state.combine &&
						<AdvMultiLineChart devices={this.props.devices} width={this.state.width} height={this.state.height}/>
					}
					{!this.state.combine &&
						<div>
							<nav>
								<div className="nav nav-tabs add-scroll-x" id="nav-chart-tab" role="tablist">
									{this.renderChartTabs()}
								</div>
							</nav>
							<div className="tab-content" id="nav-chart-tabContent">
								{this.renderChartDetails()}
							</div>
						</div>
					}
				</div>
			</div>
		)
	}
}

class TabChart extends React.PureComponent {
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
					<LineChart dev_id={this.props.device.id} width={this.props.width} height={this.props.height}/>
				}
				{this.state.chart_sw == 1 && this.props.device &&
					<BarChart dev_id={this.props.device.id} width={this.props.width} height={this.props.height}/>
				}
			</div>
		)
	}
}

class Details extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			device_list: [],
			socket: 'ws://'+window.location.host+'/devices/',
			exp_chart: [],
			exp_log: [],
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.devices != nextProps.devices) {
			this.getDeviceList(nextProps)
		}
	}

	getDeviceList(props) {
		let devices = props.devices
		devices = devices.slice(0, -1)

		if (devices != '') {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-details/'+devices+'/?format=json', function(result) {
				this.setState({
					device_list: result,
				});
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-dwchart/'+devices+'/?format=json', function(result) {
				this.setState({
					exp_chart: result,
				});
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-dwlog/'+devices+'/?format=json', function(result) {
				this.setState({
					exp_log: result,
				});
			}.bind(this))
		} else {
			this.setState({
				device_list: [],
				exp_chart: [],
				exp_log: [],
			});
		}
	}

	handleData(data) {
		let result = JSON.parse(data)
		if (result.text == "received an updated device"){
			this.getDeviceList(this.props)
		}
	}

	renderDeviceTabs() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-det-tab-".concat(device.id.toString())
				let target_id = "nav-det-panel-".concat(device.id.toString())
				let key = "det-tab-key-".concat(device.id.toString())
				return (
					<a className={i == 0 ? 'nav-item nav-link db-t-font active': 'nav-item nav-link db-t-font'} key={key} id={id} data-toggle="tab" href={"#".concat(target_id)} role="tab" aria-controls={target_id} aria-selected="false">dev{device.id}</a>
				)
			}, this)
		}
	}

	renderDeviceDetails() {
		let devices = this.state.device_list
		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("%d/%m/%Y %H:%M:%S")

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-det-panel-".concat(device.id.toString())
				let target_id = "nav-det-tab-".concat(device.id.toString())
				let key = "det-key-".concat(device.id.toString())
				let l_date = parseRealDate(device.modified.substring(0, device.modified.length-4))
				let dw_chart = []
				let dw_log = []
				dw_chart = this.state.exp_chart.filter(function(dev) {
					return dev.device_id == device.id
				})
				dw_log = this.state.exp_log.filter(function(dev) {
					return dev.device_id == device.id
				})
				return (
					<div className={i == 0 ? 'tab-pane fade show active':'tab-pane fade'} key={key}  id={id} role="tabpanel" aria-labelledby={target_id}>
						<div className="pl-2 pt-2">
							<p className="db-t-font m-p">
								Name & ID
							</p>
							<p className="dt-font pl-2 m-p">
								{device.name} {device.id}
							</p>
							<p className="db-t-font m-p">
								Description
							</p>
							<p className="dt-font pl-2 m-p">
								{device.info}
							</p>
							<p className="db-t-font m-p">
								Address
							</p>
							<p className="dt-font pl-2 m-p">
								{device.ip_addr}
							</p>
							<p className="db-t-font m-p">
								Last Update
							</p>
							<p className="dt-font pl-2 m-p">
								{dateFormat(l_date)}
							</p>
							<p className="m-p">
								<span className="db-t-font">Timer </span>
								<span className="dt-font"> {device.timer}</span>
							</p>
							<p className="m-p">
								<span className="db-t-font">Threshold </span>
								<span className="dt-font"> {device.th_min} to {device.th_max}</span>
							</p>
							<p className="m-p">
								<span className="db-t-font">Value </span>
								<span className="dt-font"> {device.value}</span>
							</p>
							<p className="m-p text-warning">
								<span className="db-t-font">24h Warnings </span>
								<span className="dt-font"> {device.number_of_war}</span>
							</p>
							<p className="m-p text-danger">
								<span className="db-t-font">24h Errors </span>
								<span className="dt-font"> {device.number_of_err}</span>
							</p>
							{dw_chart.length > 0 &&
							<CSVLink data={dw_chart} className="btn btn-block btn-outline-secondary hf-width p-0">
								<img src="../../static/third_party/open-iconic-master/svg/share-boxed.svg" alt="+"/> <span className="text-center">Export Data</span>
							</CSVLink>
							}
							{dw_log.length > 0 && 
							<CSVLink data={dw_log} className="btn btn-block btn-outline-secondary hf-width p-0">
								<img src="../../static/third_party/open-iconic-master/svg/share-boxed.svg" alt="+"/> <span className="text-center">Export Log</span>
							</CSVLink>
							}
						</div>
					</div>
				)
			}, this)
		}
	}

	render() {
		return (
			<div>
				<Websocket ref="socket" url={this.state.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="card-header">
					Details
				</div>
				<div className="card-body p-0 m-0">
					<nav>
						<div className="nav nav-tabs add-scroll-x" id="nav-details-tab" role="tablist">
							{this.renderDeviceTabs()}
						</div>
					</nav>
					<div className="tab-content " id="nav-details-tabContent">
						{this.renderDeviceDetails()}
					</div>
				</div>
			</div>
		)
	}
}

class Commands extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			device_list: [],
			open: false,
			cmd: 'cmd-no',
			dev_name: '',
			dev_info: '',
			dev_timer: 0,
			dev_th_min: 0,
			dev_th_max: 0,
			dev_id: 0,
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.devices != nextProps.devices) {
			this.getDeviceList(nextProps)
		}
	}

	openModal(device_id, event) {
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
					id: device_id
				})
				break;
			defaul:
				cmd='cmd-no'
		}

		this.setState({
			open: true,
			cmd: cmd,
			dev_id: device_id
		})
	}

	closeModal(event) {
		this.setState({
			open: false,
		})
	}

	handleChangeInfo(event) {
		event.preventDefault()
		this.props.sendSocketMessage({
			command: this.state.cmd,
			name: this.state.dev_name,
			info: this.state.dev_info,
			id: this.state.dev_id,
		})
		this.setState({
			open: false,
		})
	}

	handleChangeTimer(event) {
		event.preventDefault()
		this.props.sendSocketMessage({
			command: this.state.cmd,
			timer: this.state.dev_timer,
			id: this.state.dev_id,
		})
		this.setState({
			open: false,
		})
	}

	handleChangeTh(event) {
		event.preventDefault()
		this.props.sendSocketMessage({
			command: this.state.cmd,
			th_min: this.state.dev_th_min,
			th_max: this.state.dev_th_max,
			id: this.state.dev_id,
		})
		this.setState({
			open: false,
		})
	}

	getDeviceList(props) {
		let devices = props.devices
		devices = devices.slice(0, -1)

		if (devices != '') {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-details/'+devices+'/?format=json', function(result) {
				this.setState({
					device_list: result,
				});
			}.bind(this))
		} else {
			this.setState({
				device_list: [],
			});
		}
	}

	renderCommandTabs() {
		let devices = this.state.device_list

		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-cmd-tab-".concat(device.id.toString())
				let target_id = "nav-cmd-panel-".concat(device.id.toString())
				let key = "cmd-tab-key-".concat(device.id.toString())
				return (
					<a className={i == 0 ? 'nav-item nav-link db-t-font active': 'nav-item nav-link db-t-font'} key={key} id={id} data-toggle="tab" href={"#".concat(target_id)} role="tab" aria-controls={target_id} aria-selected="false">dev{device.id}</a>
				)
			}, this)
		}
	}

	renderCommands(device) {
		let device_id = device.id
		let openModal = this.openModal.bind(this, device_id)
		return device.commands.map(function(cmd) {
			let cmd_key = "cmd-".concat(cmd);
			return(
				<div className="border-bottom" key={cmd_key}>
					<button type="button" data-cmd={cmd_key} className="btn btn-block b-t-font m-bg-color" onClick={openModal}>
						<span data-cmd={cmd_key} className="text-center">{cmd}</span>
					</button>
				</div>
			)
		}, this)
	}

	renderDeviceCommands() {
		let devices = this.state.device_list
		if (devices.length > 0) {
			devices.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ) 
			return devices.map(function(device, i) {
				let id = "nav-cmd-panel-".concat(device.id.toString())
				let target_id = "nav-cmd-tab-".concat(device.id.toString())
				let key = "cmd-key-".concat(device.id.toString())
				let device_id = device.id
				let openModal = this.openModal.bind(this, device_id)
				return (
					<div className={i == 0 ? 'tab-pane fade show active':'tab-pane fade'} key={key}  id={id} role="tabpanel" aria-labelledby={target_id}>
						<div className="border-bottom" key="cmd-ci">
							<button type="button" data-cmd="cmd-ci" className="btn btn-block b-t-font m-bg-color" onClick={openModal}>
								<span data-cmd="cmd-ci" className="text-center">Change Information</span>
							</button>
						</div>
						<div className="border-bottom" key="cmd-ti">
							<button type="button" data-cmd="cmd-ti" className="btn btn-block b-t-font m-bg-color" onClick={openModal}>
								<span data-cmd="cmd-ti" className="text-center">Change Timer</span>
							</button>
						</div>
						<div className="border-bottom" key="cmd-th">
							<button type="button" data-cmd="cmd-th" className="btn btn-block b-t-font m-bg-color" onClick={openModal}>
								<span data-cmd="cmd-th" className="text-center">Change Threshold</span>
							</button>
						</div>
						{this.renderCommands(device)}
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
				)
			}, this)
		}
	}

	render() {
		return (
			<div>
				<div className="card-header">
					Commands
				</div>
				<div className="card-body p-0 m-0">
					<nav>
						<div className="nav nav-tabs add-scroll-x" id="nav-details-tab" role="tablist">
							{this.renderCommandTabs()}
						</div>
					</nav>
					<div className="tab-content add-scroll-y downtab" id="nav-details-tabContent">
						{this.renderDeviceCommands()}
					</div>
				</div>
			</div>
		)
	}
}

Dashboard.propTypes = {
	current_user: PropTypes.object,
	socket: PropTypes.string,
}

Details.propTypes = {
	devices: PropTypes.string,
}

Commands.propTypes = {
	current_user: PropTypes.object,
	devices: PropTypes.string,
}

Chart.propTypes = {
	devices: PropTypes.string
}