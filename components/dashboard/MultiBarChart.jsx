import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'
import Tooltip from './Tooltip.jsx'

export default class MultiBarChart extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
			tip_style: null,
			tip_content: '',
			check_h: true,
			check_d: false,
		}

		this.switch_data = 0
	}

	getData(props) {
		let devices = null
		if (props) {
			devices = props.devices
		} else {
			devices = this.props.devices
		}
		devices = devices.map(String)
		devices = devices.toString()
		devices = devices.replace(",", "-")

		if(this.switch_data == 0) {
			if (devices != '') {
				this.serverReqiest = $.get('http://192.168.10.201:8000/api/devices-bhchart/'+devices+'/?format=json', function(result) {
					this.setState({
						data: result,
					})
				}.bind(this))
			} else {
				this.setState({
					data: []
				})
			}
		} else {
			if (devices != '') {
				this.serverReqiest = $.get('http://192.168.10.201:8000/api/devices-bdchart/'+devices+'/?format=json', function(result) {
					this.setState({
						data: result,
					})
				}.bind(this))
			} else {
				this.setState({
					data: []
				})
			}
		}
	}

	componentDidMount() {
		this.getData()
	}

	displayTip(d) {
		this.setState({
			tip_style: {
				top: d3.event.offsetY+50,
				left: d3.event.offsetX+5,
				opacity: 0.8,
				backgroundColor: '#77dfd1',
			},
			tip_content: "Date: "+d.day+" Value: "+d.avg_val+"Devoce: "+d.device_id
		})
	}

	componentWillReceiveProps(nextProps) {
		this.getData(nextProps)
	}

	hideTip(d) {
		this.setState({
			tip_style: null,
			tip_content: '',
		})
	}

	handleHourlyChange(event) {
		this.setState({
			check_h: true,
			check_d: false,
		})
		this.switch_data = 0
		this.getData()
	}

	handleDailyChange(event) {
		this.setState({
			check_h: false,
			check_d: true,
		})
		this.switch_data = 1
		this.getData()
	}

	renderBarChart() {
		var data = this.state.data
		if (data.length > 0) {

			var margin = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 40,
			}

			var width = this.props.width - margin.left  - margin.right
			var height = this.props.height - margin.bottom - margin.top

			var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")

			var x = d3.scaleBand()
				.rangeRound([0, width])
				.paddingInner(0.2)

			var x_dev = d3.scaleBand()
   				.padding(0.05)

   			var y = d3.scaleLinear()
    			.rangeRound([height, 0])

    		var color = d3.scaleOrdinal(d3.schemeCategory20)

    		if (this.switch_data == 0 ){
				var xAxis = d3.axisBottom(x)
					.tickFormat(d3.timeFormat("%H:%M:%S"));
			} else {
				var xAxis = d3.axisBottom(x)
					.tickFormat(d3.timeFormat("%Y-%m-%d"));
			}

			var yAxis = d3.axisLeft(y)	

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

	    	try {
			    data.forEach(function(d) {
			    	if (parseDate(d.day)) {
			    		d.day = parseDate(d.day)
			    	}
			    	d.avg_val = d.avg_val
			    })
			} catch(e) {
				//
			}

			var dataNest = d3.nest()
	    		.key(function(d) {return d.day})
	    		.key(function(d) {return d.device_id})
	    		.entries(data)

	    	console.log(dataNest)

	    	x.domain(data.map(function(d) {return d.day}))
	    	var devices = dataNest[0].values.map(function(d, i) {return d.key})
	    	console.log(devices)
	    	x_dev.domain(devices)

	    	y.domain([0, d3.max(data, function(d) {return d.avg_val})])

	    	svg.append('g')
	    		.attr('class', 'x axis')
	    		.attr('transform', 'translate(0, '+ height +')')
	    		.call(xAxis)

	    	svg.append('g')
	    		.attr('class', 'y axis')
	    		.call(yAxis)

	    	console.log(data)

	    	svg.selectAll("bar")
		    		.data(data)
		    		.enter()
	    		.append("rect")
	    			.attr("x", function(d) {
	    				return 0;
	    			})
	    			.attr("width", x_dev.bandwidth())
	    			.attr("y", function(d) { return y(d.avg_val); })
	    			.attr("height", function(d){return height - y(d.avg_val);})
	    			.style("fill", function(d) {
	    				return color(d.device_id)
	    			})


			return parent.toReact()

		} else {
			return(
    			<div className="info-font p-2">Choose devices' chart you wish to display</div>
    		)
		}
	}

	render() {
		return(
			<div className="row m-0">
				<div className="col-2 p-2">
					<form>
						<div className="radio">
							<label>
								<input type="radio" value="hourly" checked={this.state.check_h} onChange={this.handleHourlyChange.bind(this)}/>
								Hourly
							</label>
						</div>
						<div className="radio">
							<label>
								<input type="radio" value="daily" checked={this.state.check_d} onChange={this.handleDailyChange.bind(this)}/>
								Daily
							</label>
						</div>
					</form>
				</div>
				<div className="col-10 p-0">
					{this.renderBarChart()}
				</div>
			</div>
		)
	}
}