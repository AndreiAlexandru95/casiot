import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import Websocket from 'react-websocket'
import ChartLine from '../dashboard/ChartLine.jsx'

export default class Chart extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			chart: [],
			dev_id: 0,
		}
	}

	getDeviceChart(dev_id) {
		if (dev_id != 0 ) {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-chart100/'+dev_id+'/?format=json', function(result) {
				this.setState({
					chart: result
				});
			}.bind(this))
		}
	}

	componentDidMount() {
		let dev_id = this.props.dev_id
		this.getDeviceChart(dev_id)
		this.setState({
			dev_id: dev_id
		})
	}

	componentWillReceiveProps(nextProps) {
		let dev_id = nextProps.dev_id
		this.getDeviceChart(dev_id)
		this.setState({
			dev_id: dev_id
		})
	}

	handleData(data) {
		let result = JSON.parse(data);
		console.log(result);
		this.getDeviceChart();
	}

	renderChart() {
		let device_id = this.state.dev_id
		if (device_id != 0) {
			return(
				<ChartLine chart={this.state.chart}/>
			)
		} else {
			return(
				<p className="info-font">Select a Device to view its Chart</p>
			)
		}
	}

	render() {
		return(
			<div className="col-8 card lh-bl-bg-color px-0 ">
				<Websocket ref="socket" url={this.props.socket} onMessage={this.handleData.bind(this)} reconnect={true}/>
				<div className="card-header card-h-font">
					Chart
				</div>
				{this.renderChart()}
			</div>
		)
	}
}