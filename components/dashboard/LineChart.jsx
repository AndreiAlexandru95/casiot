import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import Websocket from 'react-websocket'
import * as d3 from 'd3'
import Tooltip from './Tooltip.jsx'

export default class LineChart extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			data: [],
			tip_style: null,
			zoomTransform: null,
			tip_content: '',
			socket: 'ws://'+window.location.host+'/devices/',
			th_min: 0,
			th_max: 0,
		}

		this.zoom = d3.zoom()
			.on("zoom", this.zoomed.bind(this))
	}

	getData() {
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chart100/'+this.props.dev_id+'/?format=json', function(result) {
			this.setState({
				data: result,
			});
		}.bind(this))
	}

	getThresholds() {
		this.serverRequest = $.get('http://192.168.10.201:8000/api/device/'+this.props.dev_id+'/?format=json', function(result) {
			this.setState({
				th_min: result.th_min,
				th_max: result.th_max,
			});
		}.bind(this))
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
  	}

	componentDidMount() {
		d3.select(this.refs.svg)
			.call(this.zoom)
		this.getData()
		this.getThresholds()
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	displayTip(d) {

		var parseRealDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")
		var dateFormat = d3.timeFormat("%d/%m/%Y %H:%M:%S")

		console.log(d)

		this.setState({
			tip_style: {
				top: d3.event.offsetY+120,
				left: d3.event.offsetX+5,
				opacity: 0.8,
				backgroundColor: '#00aaf6e6',
				color: 'white',
			},
			tip_content: "Date: "+dateFormat(parseRealDate(d.date.toString().substring(0, d.date.toString().length-4)))+" Value: "+d.value
		})
	}

	hideTip(d) {
		this.setState({
			tip_style: null,
			tip_content: '',
		})
	}

	renderLineChart() {
		var data = this.state.data
		var th_min = this.state.th_min
		var th_max = this.state.th_max
		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 30,
				bottom: 50,
				left: 30,
			}
			var width = this.props.width - margin.left - margin.right
			var height = this.props.height - margin.top - margin.bottom

			var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")

			var x = d3.scaleTime()
				.range([0, width])

			var y = d3.scaleLinear()
				.range([height, 0])

			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			
			var line = d3.line()
				.x(function(d) {return x(d.date)})
				.y(function(d) {return y(d.value)})

			var min_line = d3.line()
				.x(function(d) {return x(d.date)})
				.y(function(d) {return y(th_min)}) 

			var max_line = d3.line()
				.x(function(d) {return x(d.date)})
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

	    	try {
		    	data.forEach(function(d) {
		    		d.date = parseDate(d.date.substring(0, d.date.length-4))
		    		d.value = d.value
		    	})
	    	} catch(e) {
	    		//
	    	}

	    	x.domain(d3.extent(data, function(d) {return d.date}))
	    	y.domain(d3.extent(data, function(d) {return d.value}))

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

	    	svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)
	    		.selectAll(".dot")
	    			.data(data)
	    			.enter()
	    		.append("circle")
	    			.attr('ref', function(d) {return "crc-"+d.id+"-"+d.value})
	    			.attr('r', 4)
	    			.attr('cx', function(d) {return x(d.date)})
	    			.attr('cy', function(d) {return y(d.value)})
	    			.on('mouseover', this.displayTip.bind(this))
	    			.on('mouseout', this.hideTip.bind(this))

	    	return parent.toReact()
    	} else {
    		return(
    			<div className="info-font">Loading...</div>
    		)
    	}
	}

	handleData(data) {
		let result = JSON.parse(data)
		d3.select(this.refs.svg)
			.call(this.zoom)
		this.getData()
		this.getThresholds()
	}

	render() {
		return (
			<div>
				<Websocket ref="socket" url={this.state.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>					
				{this.renderLineChart()}
			</div>
		)
	}
}