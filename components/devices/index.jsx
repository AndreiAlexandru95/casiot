import React from 'react'
import ReactDOM from 'react-dom'

import Devices from './Devices.jsx'


var device_sock = 'ws://'+window.location.host+'/devices/'
var current_user = null

$.get('http://192.168.10.201:8000/api/user/?format=json', function(result){
	current_user = result
	render_component()
})

function render_component(){
	ReactDOM.render(<Devices current_user={current_user} socket={device_sock}/>, document.getElementById('dev_list'))
}