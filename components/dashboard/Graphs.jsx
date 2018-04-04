import React from 'react'
import PropTypes from 'prop-types'
import Slider, {createSliderWithTooltip} from 'rc-slider'

import * as d3 from 'd3'
import Tooltip from './Tooltip.jsx'

const SliderWithTooltip = createSliderWithTooltip(Slider);

export default class Graphs extends React.PureComponent {
	constructor(props){
		super(props)

		this.state = {
			device_list: [],
			combine: true,
			date_sl_val: 0,
			grade_sl_val: 1,
			dis_b_grad: true,
			rtm_comb_data: [],
			a_comb_data: [],
			b_comb_data: [],
			c_comb_data: [],
			d_comb_data: [],
			e_comb_data: [],
			t_comb_data: [],
		}
	}

	componentDidMount() {
		this.setState({
			device_list: this.props.device_list,
		})
	}

	componentWillReceiveProps(nextProps) {
		var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")
  		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")

		if (this.props.device_list != nextProps.device_list) {
			this.setState({
				device_list: nextProps.device_list,
			})
			if (nextProps.device_list.length > 0) {
				let devices = nextProps.device_list.map(dev => dev.id).join('-')
				this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-lchart/'+devices+'/?format=json', function(result) {
					result.forEach(function(d) {
						if (parseDate(d.day)) {
							d.day = parseDate(d.day)
						} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
							d.day = parseRealDate(d.day.substring(0, d.day.length-4))
						}
						d.avg_val = d.avg_val
					})
					this.setState({
						rtm_comb_data: result,
					})
				}.bind(this))

				nextProps.device_list.map(function(device) {
					let index = this.props.device_list.findIndex((dev)=>{return dev.id == device.id})
					if (index < 0) {
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charta/'+device.id+'/?format=json', function(data) {
							this.setState({
								a_comb_data: this.state.a_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartb/'+device.id+'/?format=json', function(data) {
							this.setState({
								b_comb_data: this.state.b_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartc/'+device.id+'/?format=json', function(data) {
							this.setState({
								c_comb_data: this.state.c_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartd/'+device.id+'/?format=json', function(data) {
							this.setState({
								d_comb_data: this.state.d_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charte/'+device.id+'/?format=json', function(data) {
							this.setState({
								e_comb_data: this.state.e_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartt/'+device.id+'/?format=json', function(data) {
							this.setState({
								t_comb_data: this.state.t_comb_data.concat(data),
							})
						}.bind(this))
					}
				}.bind(this))
			} else {
				this.setState({
					rtm_comb_data: [],
				})
			}
		}

		if (this.props.update != nextProps.update && this.props.device_list.length == nextProps.device_list.length) {
			if (this.state.device_list.length > 0) {
				let devices = this.props.device_list.map(dev => dev.id).join('-')
				this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-lchart/'+devices+'/?format=json', function(result) {
					result.forEach(function(d) {
						if (parseDate(d.day)) {
							d.day = parseDate(d.day)
						} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
							d.day = parseRealDate(d.day.substring(0, d.day.length-4))
						}
						d.avg_val = d.avg_val
					})
					this.setState({
						rtm_comb_data: result,
					})
				}.bind(this))
			} else {
				this.setState({
					rtm_comb_data: [],
				})
			}
		}
	}

	handleDateSlider(value) {
		this.setState({
			date_sl_val: value,
		})
	}

	handleCombineChange() {
		this.setState({
			combine: !this.state.combine,
		})
	}

	handleCheckChange() {
		this.setState({
			dis_b_grad: !this.state.dis_b_grad,
		})
	}

	handleBucketSlider(value) {
		this.setState({
			grade_sl_val: value,
		})
	}

	renderGraph() {
		// Depending on current state choose which data to send to display chart child
		// ...
		console.log(this.state)
		return (
			<div>
				Charts
			</div>
		)
	}

	render() {
		return (
			<div className="col-md-12 card dash-panel-height-lg p-0">
				<div className="card-header d-flex flex-row pt-0 chh">
					<div className="pth">
						Chart
					</div>
					<div className="pl-5 swidth">
						Date Gradient
						<SliderWithTooltip min={0} max={5} marks={{0: 'None', 1: '5m', 2: '15m', 3: '30m', 4: '1h', 5: '1d'}} onAfterChange={this.handleDateSlider.bind(this)} defaultValue={this.state.date_sl_val}/>
					</div>
					<div className="pl-5 swidth">
						<span>
							<span>
								<input type="checkbox" checked={!this.state.dis_b_grad} onChange={this.handleCheckChange.bind(this)}/>
							</span>
							<span>  Bucket Gradient </span>
						</span>
						<SliderWithTooltip min={1} max={500} marks={{1: '1', 500: '500'}} onAfterChange={this.handleBucketSlider.bind(this)} defaultValue={this.state.grade_sl_val} disabled={this.state.dis_b_grad}/>
					</div>
					<span className="pth pl-5">
						<input type="checkbox" checked={this.state.combine} onChange={this.handleCombineChange.bind(this)}/>
						<span>Combine</span>
					</span>
				</div>
				<div className="card-body p-0 m-0">
					{this.renderGraph()}
				</div>
			</div>
		)
	}
}

Graphs.propTypes = {
	device_list: PropTypes.array,
}