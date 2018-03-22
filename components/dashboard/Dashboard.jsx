import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'
import {CSVLink, CSVDownload} from 'react-csv'
import * as d3 from 'd3'
import AdvMultiLineChart from './AdvMultiLineChart.jsx'

export default class Dashboard extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			devices_to_show: '',
			socket: null,
		}

		this.sendSocketMessage = this.sendSocketMessage.bind(this);
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
		console.log(result)
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
					<li className={activate ? 'list-group-item active p-1 text-center dev-li cur-point': 'list-group-item p-1 text-center dev-li cur-point'} onClick={handleDeviceClick} key={key}>
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
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="col-md-10 row m-0 p-0">
					<div className="col-md-9 row m-0 p-0">
						<Chart devices={this.state.devices_to_show} />
						<div className="col-md-12 card dash-panel-height-sm p-0">
							Log
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
						<div className="card-header card-head-font dev-bg-color">
							Devices
						</div>
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

class Chart extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			width: 400,
			height: 400,
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

	componentDidMount() {
		this.updateDimensions()
		window.addEventListener("resize", this.updateDimensions)
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions)
	}

	render() {
		return (
			<div className="col-md-12 card dash-panel-height-lg p-0">
				<div className="card-header">
					Chart
				</div>
				<div className="card-body p-0 m-0" ref={input => {this.myInput = input}}>
					<AdvMultiLineChart devices={this.props.devices} width={this.state.width} height={this.state.height}/>
				</div>
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
		} else {
			this.setState({
				device_list: [],
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
					<div className="tab-content" id="nav-details-tabContent">
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
		console.log(device_id)
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
					<div className="tab-content add-scroll-y" id="nav-details-tabContent">
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