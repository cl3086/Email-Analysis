/*global chrome*/

import './App.css'
import ErrorMessage from './error_message'
import Gmail from './gmail'
import GoogleLogin from 'react-google-login'
import React, { Component } from 'react'
import config from './config'

class App extends Component {
    constructor() {
        super()
        this.state = {
            loggedInFlag: false,
            errorFlag: false,
            errorMessage: '',
            userInfo: null
        }
    }

    successLogin(res) {
        this.setState({ loggedInFlag: true, userInfo: res })
    }

    failLogin(err) {
        this.setState({ errorFlag: true, errorMessage: err })
    }

    getGoogleLoginButton() {
        return (
            <div id='loginDiv'>
              <button id='login' onClick={ this.getToken.bind(this) }>
                  Login
              </button>
            </div>
        )
    }

    getToken() {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        this.setState({ loggedInFlag: true, token })
      })
    }

    getErrorMessage() {
        return `Unable to login! Please try again or clear your cache!
                ${ this.state.errorMessage }`
    }

    render() {
        if(!this.state.loggedInFlag) {
            return this.getGoogleLoginButton()
        }
        return (
          <div>
            <ErrorMessage
              errorFlag={ this.state.errorFlag }
              errorMessage={ this.getErrorMessage() }
            />
          <Gmail token={this.state.token}/>
          </div>
        )

    }
}

export default App
