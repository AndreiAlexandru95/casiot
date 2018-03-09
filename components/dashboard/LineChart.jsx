import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

export default class LineChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: [],
			zoomTransform: null
		}

		this.zoom = d3.zoom()
                  .scaleExtent([-5, 5])
                  .translateExtent([[-100, -100], [props.width+100, props.height+100]])
                  .extent([[-100, -100], [props.width+100, props.height+100]])
                  .on("zoom", this.zoomed.bind(this))
	}

	componentDidMount() {

		const graph = d3.select("#chart");
		const container = d3.select("#graphic");

		var containerBB = container.node().getBoundingClientRect();
		var graphBB = container.node().getBoundingClientRect();

		let parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

		var newData = this.props.data;

		try {
			newData.forEach(function(d) {
				d.date = parseDate(d.date.substring(0, d.date.length-4));
				d.value = d.value;
			});
		} catch(e) {

		}

		this.setState({
			data: newData
		});

		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	componentWillReceiveProps(nextProps) {
		let parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

		var newData = nextProps.data;

		try {
			newData.forEach(function(d) {
				d.date = parseDate(d.date.substring(0, d.date.length-4));
				d.value = d.value;
			});
		} catch(e) {

		}

		this.setState({
			data: newData
		});
	}

	componentDidUpdate() {
		d3.select(this.refs.svg)
			.call(this.zoom)
	}

	zoomed() {
	    this.setState({ 
	      zoomTransform: d3.event.transform
	    });
  	}

	render() {
		if (this.state.data.length > 0) {
			const {zoomTransform} = this.state
			return(
				<div id="chart">
					<div className="tooltip"></div>
					<svg height={this.props.height} width={this.props.width} ref="svg">
						<g transform="translate(50,20)">
							<AxisX zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data}/>
							<AxisY zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data}/>
							<Line zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data} th_max={this.props.th_max} th_min={this.props.th_min}/>
							<Scatterplot zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data}/>
						</g>
					</svg>
				</div>
			)
		} else {
			return(<p>Loading...</p>)
		}
	}
}

class AxisX extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
    	this.renderAxis()
  	}

  	componentDidUpdate() {
    	this.renderAxis()
  	}

	renderAxis() {
		var data = this.props.data;
		var margin = this.props.margin;
		var height = this.props.height - margin.top - margin.bottom;
		var width = this.props.width - margin.left - margin.right;
		var zoomTransform = this.props.zoomTransform;

		var  x = d3.scaleTime()
			.range([0, width]);

		var xAxis = d3.axisBottom(x);

		x.domain(d3.extent(data, function(d) {return d.date;}));

		if (zoomTransform) {
			x.domain(zoomTransform.rescaleX(x).domain());
		}

		d3.select(".axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
	}

	render() {
		return (
			<g className="axis axis--x"></g>
		);
	}
}

class AxisY extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
    	this.renderAxis()
  	}

  	componentDidUpdate() {
    	this.renderAxis()
  	}

  	renderAxis() {
  		var data = this.props.data;
		var margin = this.props.margin;
		var height = this.props.height - margin.top - margin.bottom;
		var width = this.props.width - margin.left - margin.right;
		var zoomTransform = this.props.zoomTransform;

		var y = d3.scaleLinear()
			.range([height, 0]);

		var yAxis = d3.axisLeft(y);

		y.domain(d3.extent(data, function(d) {return d.value;}));

		if (zoomTransform) {
			y.domain(zoomTransform.rescaleY(y).domain());
		}

		d3.select(".axis--y")
			.call(yAxis)
  	}

	render() {
		return (
			<g className="axis axis--y"></g>
		);
	}
}

class Line extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			line_data: [],
			th_min_data: [],
			th_max_data: [],
		}
	}

	componentDidMount() {
		this.renderLine()
	}

	componentWillReceiveProps() {
		this.renderLine()
	}

	renderLine() {
		var data = this.props.data;
		var margin = this.props.margin;
		var height = this.props.height - margin.top - margin.bottom;
		var width = this.props.width - margin.left - margin.right;
		var zoomTransform = this.props.zoomTransform;
		var th_min = this.props.th_min;
		var th_max = this.props.th_max;

		var x = d3.scaleTime()
			.range([0, width]);

		var y = d3.scaleLinear()
			.range([height, 0]);

		var line = d3.line()
			.x(function(d) {return x(d.date);})
			.y(function(d) {return y(d.value);});

		data.forEach(function (d) {
			x.domain(d3.extent(data, function(d) {return d.date}));
			y.domain(d3.extent(data, function(d) {return d.value}));
		});

		if (zoomTransform) {
			x.domain(zoomTransform.rescaleX(x).domain());
			y.domain(zoomTransform.rescaleY(y).domain());
		}

		var newLine = line(data)

		var th_min_line = d3.line()
			.x(function(d) {return x(d.date);})
			.y(function(d) {return y(th_min);})

		var th_max_line = d3.line()
			.x(function(d) {return x(d.date);})
			.y(function(d) {return y(th_max);})

		var th_min_data = th_min_line(data)
		var th_max_data = th_max_line(data)

		this.setState({
			line_data: newLine,
			th_min_data: th_min_data,
			th_max_data: th_max_data,
		})
	}

	render() {
		return(
			<svg height={this.props.height-this.props.margin.top-this.props.margin.bottom} width={this.props.width}>
				<path className="chart-line" d={this.state.line_data}></path>
				<path className="th-line" d={this.state.th_min_data}></path>
				<path className="th-line" d={this.state.th_max_data}></path>
			</svg>
		);
	}
}

class Scatterplot extends React.Component {
	constructor(props) {
		super(props);
		this.renderScatter();
	}

	componentDidMount() {
		this.renderScatter();
	}

	componentWillReceiveProps() {
		this.renderScatter();
	}

	displayLabel(event) {
		let node = d3.select(event.target);
		let date = event.target.dataset.date
		let value = event.target.dataset.value

		let pageX = event.nativeEvent.offsetX
		let pageY = event.nativeEvent.offsetY

		node.transition()
			.attr('r', 10)
			.duration(250)
			.ease(d3.easeCubicOut)
			.on('end', function() {
				let tooltip = d3.select(".tooltip");

				tooltip.transition(250)
					.style("opacity", .9);

				tooltip.html(date + "<br/>" + value)
					.style("left", (pageX) + "px")
					.style("top", (pageY-30) + "px");
			});
	}

	hideLabel(event) {
		let node = d3.select(event.target);

		node.transition()
			.attr('r', 3)
			.duration(250)
			.ease(d3.easeCubicOut)
			.on('end', function() {
				let tooltip = d3.select(".tooltip");

				tooltip.transition(250)
					.style("opacity", 0);
			});
	}

	renderScatter() {
		var data = this.props.data;
		var margin = this.props.margin;
		var height = this.props.height - margin.top - margin.bottom;
		var width = this.props.width - margin.left - margin.right;
		var zoomTransform = this.props.zoomTransform;

		this.xScale = d3.scaleTime()
			.domain(d3.extent(data, function(d) {return d.date;}))
			.range([0, width]);

		this.yScale = d3.scaleLinear()
			.domain(d3.extent(data, function(d) {return d.value;}))
			.range([height, 0]);

		if (zoomTransform) {
			this.xScale.domain(zoomTransform.rescaleX(this.xScale).domain());
			this.yScale.domain(zoomTransform.rescaleY(this.yScale).domain());
		}
	}

	render() {
		return(
			<svg height={this.props.height-this.props.margin.top-this.props.margin.bottom} width={this.props.width}>
				{this.props.data.map(function(cr_node) {
					let key = "circ-".concat(cr_node.id);
					let ref = "circ-".concat(cr_node.id);
					let value = cr_node.value.toString();
					let date = cr_node.date.toString();

					return(
						<circle data-date={date} data-value={value} cx={this.xScale(cr_node.date)} cy={this.yScale(cr_node.value)} r={2} key={key} ref={ref} onMouseOver={this.displayLabel.bind(this)} onMouseOut={this.hideLabel.bind(this)}/>
					);

				}, this)}
			</svg>
		)
	}
}

LineChart.propTypes = {
	data: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
	margin: PropTypes.object
}