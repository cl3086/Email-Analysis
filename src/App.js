import React, { Component } from 'react'
import './App.css'
import Map from './map'

class App extends Component {
    constructor() {
        super()
        this.state = {
            counter: 1
        }
    }

    handleClick(event) {
        this.setState({
            counter: this.state.counter + 1
        })
    }

    render() {
        return (
          <div>
            <Map/>
            <button onClick={ this.handleClick.bind(this) }>{this.state.counter}</button>
          </div>
        )
    }
}

export default App

// google maps api key: AIzaSyCg9rksfq9p3Y5vpPWPBVXbbi38w_GSDOE
// gmail api: 505532977879-0bbfrj8bcbscj7nflulcp9h1amok0vkh.apps.googleusercontent.com
