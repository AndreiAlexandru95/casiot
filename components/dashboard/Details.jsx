import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

import {CSVLink, CSVDownload} from 'react-csv'

export default class Details extends React.PureComponent {
	constructor(props){
		super(props)

		this.state = {
			device_list: [],
			exp_chart: [],
			exp_log: [],
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
				nextProps.device_list.map(function(device) {
					let index = this.props.device_list.findIndex((dev)=>{return dev.id == device.id})
					if (index < 0) {
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chart/'+device.id+'/?format=json', function(data) {
							this.setState({
								exp_chart: this.state.exp_chart.concat(data)
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-log/'+device.id+'/?format=json', function(data) {
							this.setState({
								exp_log: this.state.exp_log.concat(data)
							})
						}.bind(this))
					}
				}.bind(this))
			}
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
						<div className="pl-2 pt-2 uptab add-scroll-y">
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
			<div className="col-md-12 card dash-panel-height-lg p-0">
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

Details.propTypes = {
	device_list: PropTypes.array,
}