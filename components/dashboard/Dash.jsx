import React from 'react'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import Modal from 'react-responsive-modal'

import Graphs from './Graphs.jsx'
import Logs from './Logs.jsx'
import Details from './Details.jsx'
import Commands from './Commands.jsx'

export default class Dash extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			device_list: [],
			device_show_list: [],
			open: false,
			dev_key: '',
			device_socket: null,
			update: false,
		}

		this.sendSocketMessage = this.sendSocketMessage.bind(this)
	}

	componentDidMount() {
		this.setState({
			device_socket: this.refs.device_socket,
		})
		this.getDeviceList()
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

	getDeviceList() {
		this.serverRequest = $.get('http://192.168.10.207:8000/api/devices/?format=json', function(result) {
			this.setState({
				device_list: result,
			});
		}.bind(this))
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
			command: 'cmd-fl_db',
			is_superuser: this.props.current_user.is_superuser,
		})
	}

	sendSocketMessage(message) {
		const device_socket = this.state.device_socket
		device_socket.state.ws.send(JSON.stringify(message))
	}

	handleData(data) {
		let result = JSON.parse(data)
		this.getDeviceList()
		let devices = this.state.device_show_list.map(dev => dev.id).join('-')
		if (devices != '') {
			this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-details/'+devices+'/?format=json', function(data) {
				this.setState({
					device_show_list: data,
					update: !this.state.update,
				})
			}.bind(this))
		}
	}

	handleDeviceClick(device, event){
		let index = this.state.device_show_list.filter((dev)=>{return dev.id == device.id})[0]
		if (index) {
			this.setState({
				device_show_list: this.state.device_show_list.filter((dev)=>{return dev.id != device.id})
			})
		} else {
			this.setState({
				device_show_list: this.state.device_show_list.concat(device)
			})
		}		
	}

	renderDeviceList() {
		let devices = this.state.device_list
		let act_dev = this.state.device_show_list
		let username = this.props.current_user.username

		if (devices.length > 0){
			return devices.map(function(device) {
				let key = "dev-li-".concat(device.id.toString())
				let handleDeviceClick = this.handleDeviceClick.bind(this, device)
				let activeDev = act_dev.filter((dev)=>{return dev.id == device.id})[0]
				let activate = false
				if (activeDev) {
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

	render() {
		return (
			<div className="row">
			<Websocket ref="device_socket" url={this.props.device_socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="col-md-10 row m-0 p-0">
					<div className="col-md-9 row m-0 p-0">
						<Graphs device_list={this.state.device_show_list} />
						<Logs device_list={this.state.device_show_list} update={this.state.update}/>
					</div>
					<div className="col-md-3 row m-0 p-0">
						<Details device_list={this.state.device_show_list} />
						<Commands device_list={this.state.device_show_list} current_user={this.props.current_user} sendSocketMessage={this.sendSocketMessage} />
					</div>
				</div>
				<div className="col-md-2 p-0 m-0">
					<div className="card bg-light">
						<div className="card-header card-head-font dev-bg-color d-flex justify-content-between chh pt-2">
							<div className="pb-2">
								Devices
							</div>
							<div>
								{this.props.current_user.is_superuser &&
									<button type="button" className="btn btn-block b-t-font m-bg-color p-1" onClick={this.openModal.bind(this)}>
										<img src="../../static/third_party/open-iconic-master/svg/aperture.svg" alt="-"/> <span className="text-center">Flush</span>
									</button> 
								}
								{!this.props.current_user.is_superuser && 
									<button type="button" className="btn btn-block b-t-font m-bg-color p-1" onClick={this.openModal.bind(this)}>
										<img src="../../static/third_party/open-iconic-master/svg/plus.svg" alt="+"/> <span className="text-center">Add</span>
									</button>
								}
							</div>
						</div>
						{this.props.current_user.is_superuser &&
							<Modal open={this.state.open} onClose={this.closeModal.bind(this)} little>
								<button className="btn btn-block b-t-font m-bg-color mt-4">Flush Database</button>
							</Modal>
						}
						{!this.props.current_user.is_superuser &&
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
						}
						<div className="card-body p-0">
							<ul className="list-group">
								{this.renderDeviceList()}
							</ul>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

Dash.propTypes = {
	current_user: PropTypes.object,
	device_socket: PropTypes.string,
}
