import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'

import Tooltip from './Tooltip.jsx'

export default class ChartLine extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			zoomTransform: null,
			tip_style: null,
			tip_content: '',
		}

		this.zoom = d3.zoom()
                .on("zoom", this.zoomed.bind(this))
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
  	}

	componentDidMount() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	displayTip(d) {
		this.setState({
			tip_style: {
				top: d3.event.offsetY+30,
				left: d3.event.offsetX+5,
				opacity: 0.8,
				backgroundColor: '#77dfd1',
			},
			tip_content: "Date: "+d.date+" Value: "+d.value
		})
		console.log(d3.event)
	}


	hideTip(d) {
		this.setState({
			tip_style: null,
			tip_content: '',
		})
	}

	render() {
		var data = this.props.chart
		if (data.length > 0) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 50,
			}
			var width = 900 - margin.left - margin.right
			var height = 600 - margin.top - margin.bottom

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

	    	svg.append('svg')
	    			.attr('width', width)
	    			.attr('height', height)
	    		.append('path')
	    			.datum(data)
	    			.attr('class', 'line')
	    			.attr('d', line)

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
    			<div>Salut</div>
    		)
    	}
	}
}