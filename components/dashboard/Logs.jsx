import React from 'react'
import PropTypes from 'prop-types'

export default class Logs extends React.PureComponent {
	constructor(props){
		super(props)

		this.state = {
			device_list: [],
		}
	}

	componentDidMount() {
		this.setState({
			device_list: this.props.device_list,
		})
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.device_list != nextProps.device_list) {
			this.setState({
				device_list: nextProps.device_list,
			})
		}
	}

	render() {
		return (
			<div className="col-md-12 card dash-panel-height-sm p-0">
				<div className="card-header">
					Logs
				</div>
				<div className="card-body p-0 m-0">
				</div>
			</div>
		)
	}
}