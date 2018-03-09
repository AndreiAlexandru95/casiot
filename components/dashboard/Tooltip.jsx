import React from 'react'
import PropTypes from 'prop-types'


const Tooltip = ({ style={}, content}) => (
	<div className='tooltip' style={style}>
		{content}
	</div>
)

Tooltip.propTypes = {
	content: PropTypes.string,
	style: PropTypes.object,
}

export default Tooltip