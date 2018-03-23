import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import Websocket from 'react-websocket'
import * as d3 from 'd3'
import Slider, {createSliderWithTooltip} from 'rc-slider'
import {largestTriangleThreeBucket} from 'd3fc-sample'

const SliderWithTooltip = createSliderWithTooltip(Slider);

export default class AdvMultiLineChart extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			socket: 'ws://'+window.location.host+'/devices/',
			data: [],
			zoomTransform: null,
			date_sl_val: 0,
			grade_sl_val: 1,
			org_data: [],
			org_data_a: [],
			org_data_b: [],
			org_data_c: [],
			org_data_d: [],
			org_data_e: [],
			size_t: [],
			size_a: [],
			size_b: [],
			size_c: [],
			size_d: [],
			size_e: [],
			dis_b_grad: true,
		}

		this.zoom = d3.zoom()
			.on("zoom", this.zoomed.bind(this))
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
  	}

  	getRealTimeData(props) {
  		var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")
  		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
  		if (props) {
  			var dev_id = props.devices.slice(0, -1)
  		} else {
  			var dev_id = this.props.devices.slice(0,-1)
  		}
  		if (dev_id != '') {
	  		this.serverRequest = $.get('http://192.168.10.201:8000/api/devices-lchart/'+dev_id+'/?format=json', function(result) {
			    result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					data: result,
				});
			}.bind(this))
  		} else {
  			this.setState({
  				data: [],
  			})
  		}
  	}

  	componentDidMount() {
  		let devices = this.props.devices.split("-")
  		var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")
		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
  		this.getRealTimeData()
  		if (devices.length > 0) {
  			devices.pop()
  			devices.forEach(function(dev_id) {
  				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charta/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data_a: this.state.org_data_a.concat(result),
						size_a: this.state.size_a.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartb/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data_b: this.state.org_data_b.concat(result),
						size_b: this.state.size_b.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartc/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data_c: this.state.org_data_c.concat(result),
						size_c: this.state.size_c.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartd/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data_d: this.state.org_data_d.concat(result),
						size_d: this.state.size_d.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charte/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data_e: this.state.org_data_e.concat(result),
						size_e: this.state.size_e.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
				this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartt/'+dev_id+'/?format=json', function(result) {
					result.forEach(function(d) {
					   	if (parseDate(d.day)) {
					   		d.day = parseDate(d.day)
					   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
					   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
					   	}
					   	d.avg_val = d.avg_val
					})
					this.setState({
						org_data: this.state.org_data.concat(result),
						size_t: this.state.size_t.concat({
							dev_id: dev_id,
							size: result.length,
						}),
					})
				}.bind(this))
  			}.bind(this))
  		}
  	}

	componentWillReceiveProps(nextProps) {
		let cur_dev_list = this.props.devices.split("-")
		let new_dev_list = nextProps.devices.split("-")
		var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")
		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")

		cur_dev_list.pop()
		new_dev_list.pop()

		if (cur_dev_list.length < new_dev_list.length) {
			// A new device was selected need to get its data
			let device = new_dev_list.filter(function(x) {return cur_dev_list.indexOf(x) < 0})
			let dev_id = device[0]
			this.getRealTimeData(nextProps)
			// Request all data of device and append to org data.
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charta/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data_a: this.state.org_data_a.concat(result),
					size_a: this.state.size_a.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartb/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data_b: this.state.org_data_b.concat(result),
					size_b: this.state.size_b.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartc/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data_c: this.state.org_data_c.concat(result),
					size_c: this.state.size_c.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartd/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data_d: this.state.org_data_d.concat(result),
					size_d: this.state.size_d.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-charte/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data_e: this.state.org_data_e.concat(result),
					size_e: this.state.size_e.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chartt/'+dev_id+'/?format=json', function(result) {
				result.forEach(function(d) {
				   	if (parseDate(d.day)) {
				   		d.day = parseDate(d.day)
				   	} else if (parseRealDate(d.day.substring(0, d.day.length-4))) {
				   		d.day = parseRealDate(d.day.substring(0, d.day.length-4))
				   	}
				   	d.avg_val = d.avg_val
				})
				this.setState({
					org_data: this.state.org_data.concat(result),
					size_t: this.state.size_t.concat({
						dev_id: dev_id,
						size: result.length,
					}),
				})
			}.bind(this))
		} else if(cur_dev_list.length > new_dev_list.length) {
			// A device was eliminated so we have to delete its data
			let device = cur_dev_list.filter(function(x) {return new_dev_list.indexOf(x) < 0})
			let dev_id = device[0]
			this.getRealTimeData(nextProps)
			var size_obj_list_a = this.state.size_a.filter(function(obj) {return obj.dev_id == dev_id})
			let size_obj_a = size_obj_list_a[0]
			let index = this.state.size_a.indexOf(size_obj_a)

			if (!this.state.size_t[index]){
				setTimeout(this.deleteDeviceFromData.bind(this, index, dev_id), 2000)
			} else {
				this.deleteDeviceFromData(index, dev_id)
			}
		}
	}

	deleteDeviceFromData(index, dev_id){
		if (index < 0) {
			var size_obj_list_a = this.state.size_a.filter(function(obj) {return obj.dev_id == dev_id})
			let size_obj_a = size_obj_list_a[0]
			index = this.state.size_a.indexOf(size_obj_a)
		}
		let size_a_val = this.state.size_a[index].size
			let size_b_val = this.state.size_b[index].size
			let size_c_val = this.state.size_c[index].size
			let size_d_val = this.state.size_d[index].size
			let size_e_val = this.state.size_e[index].size
			let size_t_val = this.state.size_t[index].size

			let org_data_a = this.state.org_data_a
			let org_data_b = this.state.org_data_b
			let org_data_c = this.state.org_data_c
			let org_data_d = this.state.org_data_d
			let org_data_e = this.state.org_data_e
			let org_data = this.state.org_data

			let size_a = this.state.size_a
			let size_b = this.state.size_b
			let size_c = this.state.size_c
			let size_d = this.state.size_d
			let size_e = this.state.size_e
			let size_t = this.state.size_t

			if (index == 0) {
				this.setState({
					org_data: org_data.slice(size_t_val),
					org_data_a: org_data_a.slice(size_a_val),
					org_data_b: org_data_b.slice(size_b_val),
					org_data_c: org_data_c.slice(size_c_val),
					org_data_d: org_data_d.slice(size_d_val),
					org_data_e: org_data_e.slice(size_e_val),
					size_a: size_a.slice(1),
					size_b: size_b.slice(1),
					size_c: size_c.slice(1),
					size_d: size_d.slice(1),
					size_e: size_e.slice(1),
					size_t: size_t.slice(1),
				})
			} else if (index == size_a.length-1 && size_a.length !=0) {
				this.setState({
					org_data: org_data.slice(0,0-size_t_val),
					org_data_a: org_data_a.slice(0,0-size_a_val),
					org_data_b: org_data_b.slice(0,0-size_b_val),
					org_data_c: org_data_c.slice(0,0-size_c_val),
					org_data_d: org_data_d.slice(0,0-size_d_val),
					org_data_e: org_data_e.slice(0,0-size_e_val),
					size_a: size_a.slice(0, -1),
					size_b: size_b.slice(0, -1),
					size_c: size_c.slice(0, -1),
					size_d: size_d.slice(0, -1),
					size_e: size_e.slice(0, -1),
					size_t: size_t.slice(0, -1),
				})
			} else if (index > -1) {
				let prev_index = index - 1
				let prev_size_a = this.state.size_a[prev_index].size
				let prev_size_b = this.state.size_b[prev_index].size
				let prev_size_c = this.state.size_c[prev_index].size
				let prev_size_d = this.state.size_d[prev_index].size
				let prev_size_e = this.state.size_e[prev_index].size
				let prev_size_t = this.state.size_t[prev_index].size
				this.setState({
					org_data: org_data.slice(prev_size_t, size_t_val),
					org_data_a: org_data_a.slice(prev_size_a,size_a_val),
					org_data_b: org_data_b.slice(prev_size_b,size_b_val),
					org_data_c: org_data_c.slice(prev_size_c,size_c_val),
					org_data_d: org_data_d.slice(prev_size_d,size_d_val),
					org_data_e: org_data_e.slice(prev_size_e,size_e_val),
					size_a: size_a.slice(prev_index,1),
					size_b: size_b.slice(prev_index,1),
					size_c: size_c.slice(prev_index,1),
					size_d: size_d.slice(prev_index,1),
					size_e: size_e.slice(prev_index,1),
					size_t: size_t.slice(prev_index,1),
				})
			}
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	handleDateSlider(value) {
		if (value == 0) {
			this.getRealTimeData()
		}
		this.setState({
			date_sl_val: value
		})
	}

	handleBucketSlider(value) {
		if (value == 0) {
			this.getRealTimeData()
		}
		this.setState({
			grade_sl_val: value
		})
	}

	handleData(data) {
		let result = JSON.parse(data)
		this.getRealTimeData()
	}

	handleCheckChange(event) {
		this.setState({
			dis_b_grad: !this.state.dis_b_grad,
		})
	}

	renderMultiLineChart() {

		switch (this.state.date_sl_val){
			case 1:
				var data = this.state.org_data_a
				break
			case 2:
				var data = this.state.org_data_b
				break
			case 3:
				var data = this.state.org_data_c 
				break
			case 4:
				var data = this.state.org_data_d
				break
			case 5:
				var data = this.state.org_data_e 
				break
			default:
				if (this.state.dis_b_grad) {
					var data = this.state.data 
				} else {
					var data = this.state.org_data
				} 
		}
		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 50,
			}

			var width = this.props.width - margin.left - margin.right
			var height = this.props.height - margin.top - margin.bottom

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
			<div>
				<Websocket ref="socket" url={this.state.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="row m-0">
					<div className="col-6 pb-3 px-5 pt-2">
						Date Gradient
						<SliderWithTooltip min={0} max={5} marks={{0: 'None', 1: '5m', 2: '15m', 3: '30m', 4: '1h', 5: '1d'}} onAfterChange={this.handleDateSlider.bind(this)} defaultValue={this.state.date_sl_val}/>
					</div>
					<div className="col-6 pb-3 px-5 pt-2">
						<span>
							<span>
								<input type="checkbox" checked={this.state.use_b_grad} onChange={this.handleCheckChange.bind(this)}/>
							</span>
							<span>  Bucket Gradient </span>
						</span>
						<SliderWithTooltip min={1} max={500} marks={{1: '1', 500: '500'}} onAfterChange={this.handleBucketSlider.bind(this)} defaultValue={this.state.grade_sl_val} disabled={this.state.dis_b_grad}/>
					</div>
				</div>
				{this.renderMultiLineChart()}
			</div>
		)
	}
}

AdvMultiLineChart.propTypes = {
	devices: PropTypes.string
}