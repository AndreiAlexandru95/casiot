import React from 'react'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import Slider, {createSliderWithTooltip} from 'rc-slider'
import {largestTriangleThreeBucket} from 'd3fc-sample'

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
			c_width: 400,
			c_height: 400,
			s_width: 400,
			s_height: 400,
			zoomTransform: null,
		}

		this.updateDimensions = this.updateDimensions.bind(this)

		this.zoom = d3.zoom()
			.on("zoom", this.zoomed.bind(this))
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
  	}

	updateDimensions() {
		if (this.myInput) {
			this.setState({
				c_width: this.myInput.clientWidth,
				c_height: this.myInput.clientHeight-10,
				s_width: this.myInput.clientWidth,
				s_height: this.myInput.clientHeight-65,
			})
		}
	}

	componentDidMount() {
		this.updateDimensions()
		window.addEventListener("resize", this.updateDimensions)
		d3.select(this.refs.svg)
			.call(this.zoom)
		this.setState({
			device_list: this.props.device_list,
		})
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions)
	}

	displayTip(d) {
		var dateFormat = d3.timeFormat("%d/%m/%Y %H:%M:%S")
		this.setState({
			tip_style: {
				top: d3.event.offsetY+120,
				left: d3.event.offsetX+5,
				opacity: 0.8,
				backgroundColor: '#00aaf6e6',
				color: 'white',
			},
			tip_content: "Date: "+dateFormat(d.day)+" Value: "+d.avg_val
		})
	}

	hideTip(d) {
		this.setState({
			tip_style: null,
			tip_content: '',
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
				this.serverRequest = $.get('http://192.168.10.207:8000/api/devices-lchart/'+devices+'/?format=json', function(result) {
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
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-charta/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
							this.setState({
								a_comb_data: this.state.a_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-chartb/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
							this.setState({
								b_comb_data: this.state.b_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-chartc/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
							this.setState({
								c_comb_data: this.state.c_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-chartd/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
							this.setState({
								d_comb_data: this.state.d_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-charte/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
							this.setState({
								e_comb_data: this.state.e_comb_data.concat(data),
							})
						}.bind(this))
						this.serverRequest = $.get('http://192.168.10.207:8000/api/device-chartt/'+device.id+'/?format=json', function(data) {
							data.forEach(function(d) {
								if (parseDate(d.day)) {
									d.day = parseDate(d.day)
								} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
									d.day = parseRealDate(d.day.substring(0, d.day.length-4))
								}
								d.avg_val = d.avg_val
							})
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
						{this.renderChart(device.id)}
					</div>
				)
			}, this)
		}
	}

	renderChart(device_id) {

		var my_switch = 0

		switch(this.state.date_sl_val) {
			case 1:
				var data = this.state.a_comb_data
				break
			case 2:
				var data = this.state.b_comb_data
				break
			case 3:
				var data = this.state.c_comb_data
				break
			case 4:
				var data = this.state.d_comb_data
				my_switch = 1
				break
			case 5:
				var data = this.state.e_comb_data
				my_switch = 1
				break
			default:
				if (this.state.dis_b_grad) {
					var data = this.state.rtm_comb_data
					my_switch = 1
				} else {
					var data = this.state.t_comb_data
				}
		}

		data = data.filter((node)=>{return node.device_id == device_id})

		var th_min = this.state.device_list.find((dev)=> {return dev.id == device_id}).th_min
		var th_max = this.state.device_list.find((dev)=> {return dev.id == device_id}).th_max

		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 50,
			}

			var width = this.state.s_width - margin.left - margin.right
			var height = this.state.s_height - margin.top - margin.bottom

			var x = d3.scaleTime()
				.range([0, width])

			var y = d3.scaleLinear()
				.range([height, 0])

			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			
			var line = d3.line()
				.x(function(d) {return x(d.day)})
				.y(function(d) {return y(d.avg_val)})

			var min_line = d3.line()
				.x(function(d) {return x(d.day)})
				.y(function(d) {return y(th_min)}) 

			var max_line = d3.line()
				.x(function(d) {return x(d.day)})
				.y(function(d) {return y(th_max)})

			var parent = ReactFauxDOM.createElement('div')
			var node = ReactFauxDOM.createElement('svg')

			parent.appendChild(node)
			parent.appendChild(
				<Tooltip
					style={this.state.tip_style}
					content={this.state.tip_content}
					key="chart-tooltip"
				/>
			)
	    	
	    	var svg = d3.select(node)
	    			.attr('width', width + margin.left + margin.right)
	    			.attr('height', height + margin.top + margin.bottom)
	    			.attr('ref','svg')
	    		.append('g')
	    			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	    	x.domain(d3.extent(data, function(d) {return d.day}))
	    	y.domain(d3.extent(data, function(d) {return d.avg_val}))

	    	if (this.state.zoomTransform) {
	    		x.domain(this.state.zoomTransform.rescaleX(x).domain())
				y.domain(this.state.zoomTransform.rescaleY(y).domain())
	    	}

	    	svg.append('g')
	    		.attr('class', 'x axis')
	    		.attr('transform', 'translate(0, '+ height +')')
	    		.call(xAxis)

	    	svg.append('g')
	    		.attr('class', 'y axis')
	    		.call(yAxis)
	    		.append("text")
	    			.attr("fill", "#000")
	    			.attr("transform", "rotate(-90)")
	    			.attr("y", 6)
				    .attr("dy", "0.5em")
				    .attr("text-anchor", "end")
				    .text("Temperature (C)")

	    	var linesvg = svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)
	    		
	    	linesvg.append('path')
	    			.datum(data)
	    			.attr('class', 'line')
	    			.attr('d', line)

	    	linesvg.append('path')
	    			.datum(data)
	    			.attr('class', 'th-line')
	    			.attr('d', min_line)
	    	linesvg.append('path')
	    			.datum(data)
	    			.attr('class', 'th-line')
	    			.attr('d', max_line)

	    	if (my_switch == 1) {
	    		svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)
	    		.selectAll(".dot")
	    			.data(data)
	    			.enter()
	    		.append("circle")
	    			.attr('ref', function(d) {return "crc-"+d.device_id+"-"+d.avg_val})
	    			.attr('r', 4)
	    			.attr('cx', function(d) {return x(d.day)})
	    			.attr('cy', function(d) {return y(d.avg_val)})
	    			.on('mouseover', this.displayTip.bind(this))
	    			.on('mouseout', this.hideTip.bind(this))
	    	}

	    	return parent.toReact()
		}
	}

	renderMultiLineChart() {
		switch(this.state.date_sl_val) {
			case 1:
				var data = this.state.a_comb_data
				break
			case 2:
				var data = this.state.b_comb_data
				break
			case 3:
				var data = this.state.c_comb_data
				break
			case 4:
				var data = this.state.d_comb_data
				break
			case 5:
				var data = this.state.e_comb_data
				break
			default:
				if (this.state.dis_b_grad) {
					var data = this.state.rtm_comb_data
				} else {
					var data = this.state.t_comb_data
				}
		}

		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 50,
			}

			var width = this.state.c_width - margin.left - margin.right
			var height = this.state.c_height - margin.top - margin.bottom

			var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")
			var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")

			if (!this.state.dis_b_grad) {
				const sampler = largestTriangleThreeBucket()
					.x(function(d) {return d.day})
					.y(function(d) {return d.avg_val})
				sampler.bucketSize(this.state.grade_sl_val)
				data = sampler(data)
			}

			var x = d3.scaleTime()
				.range([0, width])

			var y = d3.scaleLinear()
				.range([height, 0])

			var dateFormat = d3.timeFormat("%m-%d-%H:%M:%S");

			var xAxis = d3.axisBottom(x)
			var yAxis = d3.axisLeft(y)

			var line = d3.line()
				.x(function(d) {return x(d.day)})
				.y(function(d) {return y(d.avg_val)})

			var node = ReactFauxDOM.createElement('svg')

			var svg = d3.select(node)
				.attr('width', width + margin.left + margin.right)
	    			.attr('height', height + margin.top + margin.bottom)
	    			.attr('ref','svg')
	    		.append('g')
	    			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	    	x.domain(d3.extent(data, function(d) {return d.day}))
	    	y.domain(d3.extent(data, function(d) {return d.avg_val}))

	    	if (this.state.zoomTransform) {
	    		x.domain(this.state.zoomTransform.rescaleX(x).domain())
				y.domain(this.state.zoomTransform.rescaleY(y).domain())
	    	}

	    	var dataNest = d3.nest()
	    		.key(function(d) {return d.device_id})
	    		.entries(data)

	    	var color = d3.scaleOrdinal(d3.schemeCategory10)

	    	var linesvg = svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)

	    	var legendSpace = 20

	    	dataNest.forEach(function(d, i) {
	    		linesvg.append("path")
	    			.attr("class", "line")
	    			.style("stroke", function() {
	    				return d.color = color(d.key)})
	    			.attr("d", line(d.values))

	    		linesvg.append("text")
	    			.attr("x", (margin.left/2) - 15)
	    			.attr("y", height - (margin.bottom/2)+ 5 - i*legendSpace)
	    			.style("fill", function() {
	    				return d.color = color(d.key)})
	    			.text("dev"+d.key)
	    	})

	    	svg.append('g')
	    		.attr('class', 'x axis')
	    		.attr('transform', 'translate(0, '+ height +')')
	    		.call(xAxis)

	    	svg.append('g')
	    		.attr('class', 'y axis')
	    		.call(yAxis)
	    		.append("text")
	    			.attr("fill", "#000")
	    			.attr("transform", "rotate(-90)")
	    			.attr("y", 6)
				    .attr("dy", "0.5em")
				    .attr("text-anchor", "end")
				    .text("Temperature (C)")

			return node.toReact()
		}
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
						<span> Combine </span>
					</span>
				</div>
				<div className="card-body p-0 m-0" ref={input => {this.myInput = input}}>
					{this.state.combine &&
						this.renderMultiLineChart()
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

Graphs.propTypes = {
	device_list: PropTypes.array,
}
