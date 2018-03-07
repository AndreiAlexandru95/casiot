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
					<svg height={this.props.height} width={this.props.width} ref="svg">
						<g transform="translate(50,20)">
							<AxisX zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data}/>
							<AxisY zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data}/>
							<Line zoomTransform={zoomTransform} width={this.props.width} height={this.props.height} margin={this.props.margin} data={this.state.data} x={0} y={0}/>
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
			<g className="axis--x"></g>
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
			<g className="axis--y"></g>
		);
	}
}

class Line extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			line_data: []
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

		var newLine = line(data);

		this.setState({
			line_data: newLine
		})
	}

	render() {
		return(
			<svg height={this.props.height-this.props.margin.top-this.props.margin.bottom} width={this.props.width}>
				<path className="line" d={this.state.line_data}></path>
			</svg>
		);
	}
}

LineChart.propTypes = {
	data: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
	margin: PropTypes.object
}