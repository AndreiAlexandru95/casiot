import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-responsive-modal'

export default class Commands extends React.PureComponent {
	constructor(props){
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
			<div className="col-md-12 card dash-panel-height-sm p-0">
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

Commands.propTypes = {
	device_list: PropTypes.array,
	current_user: PropTypes.object,
}