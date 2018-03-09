import React from 'react'
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'

export default class Log extends React.PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			log_list: []
		}
	}

	componentWillMount() {
		this.getLogList()
	}

	componentDidUpdate(prevProps, prevState) {
		// Since Log is a PureComponent shouldComponentUpdate() checks if this function gets triggered or not
		this.getLogList()
	}

	getLogList() {
		var dev_id = this.props.dev_id
		if (dev_id && dev_id > 0) {
			this.serverRequest = $.get('http://192.168.10.201:8000/api/device-log/'+dev_id+'?format=json', function(result) {
				this.setState({
					log_list: result,
				});
			}.bind(this))
		}
	}

	renderLog() {
		let logs = this.state.log_list

		if (logs.length > 0) {
			return logs.map(function(log) {
				let log_key = "log-".concat(log.id.toString());
				return (
					<li className="list-group-item" key={log_key}>
						{log.device_id} {log.type} {log.date} : {log.text}
					</li>
				)
			}, this)
		}
	}

	render() {
		return (
			<div className="card lg-bg-color no-pad-h border card-t-detail">
				<div className="card-header no-pad-h card-f-header">
					Log
				</div>
				<ul className="list-group list-group-flush">
					{this.renderLog()}
				</ul>
			</div>
		)
	}
}