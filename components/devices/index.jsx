import React from 'react'
import ReactDOM from 'react-dom'

import DeviceList from './DeviceList.jsx'


var device_sock = 'ws://'+window.location.host+'/devices/'
var current_user = null

$.get('http://localhost:8000/api/user/?format=json', function(result){
	current_user = result
	render_component()
})

function render_component(){
	ReactDOM.render(<DeviceList current_user={current_user} socket={device_sock}/>, document.getElementById('dev_list'))
}