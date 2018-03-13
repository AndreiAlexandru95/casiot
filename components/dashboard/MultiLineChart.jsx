import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import Websocket from 'react-websocket'
import * as d3 from 'd3'

export default class MultiLineChart extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
			zoomTransfrom: null,
		}

		this.zoom = d3.zoom()
			.on("zoom", this.zoomed.bind(this))
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
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
		if (devices != '') {
			this.serverReqiest = $.get('http://192.168.10.201:8000/api/devices-chart/'+devices+'/?format=json', function(result) {
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

	componentDidMount() {
		d3.select(this.refs.svg)
			.call(this.zoom)
		this.getData()
	}

	componentWillReceiveProps(nextProps) {
		this.getData(nextProps)
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	renderMultiLineChart() {
		var data = this.state.data
		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 50,
			}

			var width = this.props.width - margin.left - margin.right
			var height = this.props.height - margin.top - margin.bottom

			var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L")

			var x = d3.scaleTime()
				.range([0, width])

			var y = d3.scaleLinear()
				.range([height, 0])

			var xAxis = d3.axisBottom(x)
			var yAxis = d3.axisLeft(y)

			var line = d3.line()
				.x(function(d) {return x(d.date)})
				.y(function(d) {return y(d.value)})

			var node = ReactFauxDOM.createElement('svg')

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

	    	var dataNest = d3.nest()
	    		.key(function(d) {return d.device_id})
	    		.entries(data)

	    	var color = d3.scaleOrdinal(d3.schemeCategory20)

	    	var linesvg = svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)

	    	dataNest.forEach(function(d) {
	    		linesvg.append("path")
	    			.attr("class", "line")
	    			.style("stroke", function() {
	    				return d.color = color(d.key)})
	    			.attr("d", line(d.values))
	    	})

	    	svg.append('g')
	    		.attr('class', 'x axis')
	    		.attr('transform', 'translate(0, '+ height +')')
	    		.call(xAxis)

	    	svg.append('g')
	    		.attr('class', 'y axis')
	    		.call(yAxis)

			return node.toReact()
		} else {
			return(
    			<div className="info-font p-2">Choose devices' chart you wish to display</div>
    		)
		}
	}

	render() {
		return(
			<div>
				{this.renderMultiLineChart()}
			</div>
		)
	}
}