import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

export default class Logs extends React.PureComponent {
	constructor(props){
		super(props)

		this.state = {
			device_list: [],
			combine: true,
			c_logs: [],
			uc_logs: [],
			ew_logs: [],
			mode_dbg: true,
			mode_cmd: true,
			mode_ew: true,
			show_ew: false,
		}
	}

	componentDidMount() {
		this.setState({
			device_list: this.props.device_list,
		})
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.device_list != nextProps.device_list) {
			this.setState({
				device_list: nextProps.device_list,
			})
			if (nextProps.device_list.length > 0) {
				let devices = nextProps.device_list.map(dev => dev.id).join('-')
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-logs/'+devices+'/?format=json', function(result) {
					this.setState({
						c_logs: result,
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-llogs/'+devices+'/?format=json', function(result) {
					this.setState({
						uc_logs: result,
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-ewlogs/'+devices+'/?format=json', function(result) {
					this.setState({
						ew_logs: result,
					})
				}.bind(this))
			} else {
				this.setState({
					c_logs: [],
					uc_logs: [],
					ew_logs: [],
				})
			}
		}
		if (this.props.update != nextProps.update && this.props.device_list.length == nextProps.device_list.length) {
			if (this.state.device_list.length > 0) {
				let devices = this.props.device_list.map(dev => dev.id).join('-')
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-logs/'+devices+'/?format=json', function(result) {
					this.setState({
						c_logs: result,
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-llogs/'+devices+'/?format=json', function(result) {
					this.setState({
						uc_logs: result,
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-ewlogs/'+devices+'/?format=json', function(result) {
					this.setState({
						ew_logs: result,
					})
				}.bind(this))
			} else {
				this.setState({
					c_logs: [],
					uc_logs: [],
					ew_logs: [],
				})
			}
		}
	}

	handleCombineChange(event) {
		if (this.state.show_ew) {
			this.setState({
				combine: !this.state.combine,
				show_ew: false,
			})
		} else {
			this.setState({
				combine: !this.state.combine,
			})
		}
	}

	handleDBGClick() {
		this.setState({
			mode_dbg: !this.state.mode_dbg,
		})
	}

	handleCMDClick() {
		this.setState({
			mode_cmd: !this.state.mode_cmd,
		})
	}

	handleEWClick() {
		this.setState({
			mode_ew: !this.state.mode_ew,
		})
	}

	handleEWChange() {
		if (!this.state.show_ew){
			this.setState({
				show_ew: !this.state.show_ew,
				combine: false,
			})
		} else {
			this.setState({
				show_ew: !this.state.show_ew,
			})
		}
	}

	renderCombinedLogs() {
		let logs = this.state.c_logs
		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("(%d/%m/%Y %H:%M:%S)")
		if (logs.length > 0 && this.state.device_list.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString())
				let log_dev = "dev".concat(log.device_id.toString())
				let log_date = parseRealDate(log.date.substring(0, log.date.length-4))
				let log_type = log.type
				let log_text = log.text
				
				if (!this.state.mode_dbg && log_type == 'DBG') {
					return
				}

				if (!this.state.mode_cmd && log_type == 'INF') {
					return
				}

				if (!this.state.mode_ew && (log_type == 'WAR' || log_type == 'ERR')) {
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

	renderDeviceLog(device) {
		let logs = []
		if (this.state.show_ew) {
			logs = logs.concat(this.state.ew_logs)
		} else {
			logs = logs.concat(this.state.uc_logs)
		}
		logs = logs.filter((log)=>{return log.device_id == device.id})

		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("(%d/%m/%Y %H:%M:%S)")

		if (logs.length > 0) {
			return logs.map(function(log, i) {
				let log_key = "log-".concat(i.toString())

				let log_date = parseRealDate(log.date.substring(0, log.date.length-4))
				let log_type = log.type
				let log_text = log.text

				if (!this.state.show_ew) {
					if (!this.state.mode_dbg && log_type == 'DBG') {
						return
					}

					if (!this.state.mode_cmd && log_type == 'INF') {
						return
					}

					if (!this.state.mode_ew && (log_type == 'WAR' || log_type == 'ERR')) {
						return
					}
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
						{this.renderDeviceLog(device)}
					</div>
				)
			}, this)
		}
	}

	renderUnCombinedLogs() {
		return (
			<div>
				<nav>
					<div className="nav nav-tabs add-scroll-x" id="nav-chart-tab" role="tablist">
						{this.renderLogTabs()}
					</div>
				</nav>
					<div className="tab-content" id="nav-chart-tabContent">
						{this.renderLogDetails()}
				</div>
			</div>
		)
	}

	render() {
		let dbgColor = this.state.mode_dbg ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 1)"
		let cmdColor = this.state.mode_cmd ? "rgba(0, 128, 0, 0.5)" : "rgba(0, 128, 0, 1)"
		let ewColor = this.state.mode_ew ? "rgba(225, 0, 0, 0.5)" : "rgba(225, 0, 0 , 1)"
		return (
			<div className="col-md-12 card dash-panel-height-sm p-0">
				<div className="card-header d-flex flex-row">
					Logs
					<button disabled={this.state.show_ew} style={{backgroundColor: dbgColor}} className="btn btn-block b-t-font m-0 p-0 ml-5 filt-btn" onClick={this.handleDBGClick.bind(this)}></button>
					<button disabled={this.state.show_ew} style={{backgroundColor: cmdColor}} className="btn btn-block b-t-font m-0 p-0 filt-btn" onClick={this.handleCMDClick.bind(this)}></button>
					<button disabled={this.state.show_ew} style={{backgroundColor: ewColor}} className="btn btn-block b-t-font m-0 p-0 filt-btn" onClick={this.handleEWClick.bind(this)}></button>
					<span className="pl-5">
						<input type="checkbox" checked={this.state.show_ew} onChange={this.handleEWChange.bind(this)}/>
						<span>24h War/Err</span>
					</span>
					<span className="pl-5">
						<input type="checkbox" checked={this.state.combine} onChange={this.handleCombineChange.bind(this)}/>
						<span> Combine </span>
					</span>
				</div>
				<div className="card-body p-0 m-0 downtab add-scroll-y">
					{this.state.combine &&
						this.renderCombinedLogs()
					}
					{!this.state.combine &&
						this.renderUnCombinedLogs()
					}
				</div>
			</div>
		)
	}
}

Logs.propTypes = {
	device_list: PropTypes.array,
	update: PropTypes.bool,
}
