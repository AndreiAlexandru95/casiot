import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import Websocket from 'react-websocket'
import * as d3 from 'd3'
import Tooltip from './Tooltip.jsx'

export default class BarChart extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
			tip_style: null,
			tip_content: '',
			socket: 'ws://'+window.location.host+"/devices/",
			check_h: true,
			check_d: false,
		}

		this.switch_data = 0
	}

	getData() {
		if (this.switch_data == 0) {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-avgh/'+this.props.dev_id+'/?format=json', function(result) {
				this.setState({
					data: result,
				});
			}.bind(this))
		} else {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-avgd/'+this.props.dev_id+'/?format=json', function(result) {
				this.setState({
					data: result,
				});
			}.bind(this))
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
			tip_content: "Date: "+d.day+" Value: "+d.avg_val
		})
	}

	hideTip(d) {
		this.setState({
			tip_style: null,
			tip_content: '',
		})
	}

	handleData(data) {
		let result = JSON.parse(data)
		this.getData()
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
			var width = 498 - margin.left - margin.right
			var height = 400 - margin.top - margin.bottom

			var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")

			var x = d3.scaleBand()
				.rangeRound([0, width])
				.paddingInner(0.2)

			var y = d3.scaleLinear()
				.range([height, 0])

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

	    	x.domain(data.map(function(d) {return d.day}))
	    	y.domain([0, d3.max(data, function(d) {return d.avg_val})])

	    	svg.append('g')
	    		.attr('class', 'x axis')
	    		.attr('transform', 'translate(0, '+ height +')')
	    		.call(xAxis)

	    	svg.append('g')
	    		.attr('class', 'y axis')
	    		.call(yAxis)

	    	svg.selectAll("bar")
	    			.data(data)
	    			.enter()
	    		.append("rect")
	    			.attr("x", function(d) { return x(d.day); })
	    			.attr("width", x.bandwidth())
	    			.attr("y", function(d) { return y(d.avg_val); })
	    			.attr("height", function(d) {return height - y(d.avg_val);})
	    			.attr("class", 'bar-rect')
	    			.on('mouseover', this.displayTip.bind(this))
	    			.on('mouseout', this.hideTip.bind(this))

			return parent.toReact()
		} else {
			return(
    			<div className="info-font">Loading...</div>
    		)
		}
	}

	render() {
		return (
			<div className="row m-0">
				<Websocket ref="socket" url={this.state.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
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