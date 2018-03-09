import React from 'react'
import ReactDOM from 'react-dom'

import LogList from './LogList.jsx'


var current_user = null

$.get('http://192.168.10.201:8000/api/user/?format=json', function(result){
	current_user = result
	render_component()
})

function render_component(){
	ReactDOM.render(<LogList current_user={current_user}/>, document.getElementById('log_list'))
}