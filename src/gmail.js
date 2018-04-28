import _ from 'lodash'
import './gmail.css'
import Attachments from './attachments'
import axios from 'axios'
import ErrorMessage from './error_message'
import InfiniteScroll from 'react-infinite-scroller'
import Map from './map'
import React, {Component} from 'react'

const GMAILAPI = 'https://www.googleapis.com/gmail/v1/users'
const USERINFO = 'https://www.googleapis.com/oauth2/v1/userinfo'

class Gmail extends Component {
    constructor(props) {
      super(props)
      this.state = {
        emails: [],
        token: this.props.token,
        id: null,
        name: null,
        errorFlag: false,
        errorMessage: '',
        loadingFlag: false,
        selectedNum: -1,
        selectedHeaders: null,
        nextPageToken: -1
      }

      this.fetchUserInfo()
    }

    fetchUserInfo() {
      let url = USERINFO
      axios.get(url, { headers: this.getAuthHeaders() })
        .then((res) => {
          this.setState({
            name: `${res.data.given_name} ${res.data.family_name}`,
            id: res.data.id,
          })
          this.fetchFirstEmails()
        })
        .catch((err) => {
          this.setState({ errorFlag: true, errorMessage: err })
        })
    }

    fetchFirstEmails() {
      let url = `${GMAILAPI}/${this.state.id}/messages`
      axios.get(url, { headers: this.getAuthHeaders() })
        .then((emails) => {
          this.setState({ nextPage: emails.data.nextPageToken })
          this.getEmails(emails.data.messages)
        })
        .catch((err) => {
          this.setState({ errorFlag: true, errorMessage: err })
        })
    }

    getEmails(emailIds) {
      let promises = []
      _.forEach(emailIds, (id) => {
        let url = `${GMAILAPI}/${this.state.id}/messages/${id.id}`
        promises.push(axios.get(url, { headers: this.getAuthHeaders() }))
      })
      Promise.all(promises)
        .then((res) => {
          this.setState({emails: res, loadingFlag: true})
        })
        .catch((err) => {
          console.log(err)
        })
    }

    parseEmails() {
      let emails = this.state.emails
      return emails.map((email, index) => {
        let subject = _.find(email.data.payload.headers, { name: 'Subject'}).value
        let fromData = _.find(email.data.payload.headers, { name: 'From'}).value
        let snippet = email.data.snippet
        return (
          <div
            key={ index }
            className='email'
            id={ index === this.state.selectedNum ? 'selectedEmail': ''}
            onClick={ this.getHeaders.bind(this, index) }
          >
            <p className='subjectText'>{ subject }</p>
            <p className='fromText'>From: { fromData }</p>
            <p className='snippetText'>Snippet: { snippet}...</p>
          </div>
        )
      })
    }

    getHeaders(index) {
      let email = this.state.emails[index]
      if(this.state.selectedNum !== index) {
        this.setState({
          selectedNum: index,
          selectedHeaders: email.data.payload.headers
        })
      }
    }

    getAuthHeaders() {
      return {
          Authorization: `Bearer ${this.props.token}`
      }
    }

    getErrorMessage() {
      return `Something went wrong when fetching data! ${this.state.errorMessage}`
    }

    getInfiniteScrollers() {
      let loadingMessage = this.emailLoadingMessage()
      return (
        <InfiniteScroll
          pageStart={1}
          loadMore={ this.loadMoreEmails.bind(this) }
          hasMore={ true }
          initialLoad={ false }
          loader={ loadingMessage }
          useWindow={ false }
        >
          <div id='container'>{ this.parseEmails() }</div>
        </InfiniteScroll>
      )
    }

    loadMoreEmails() {
      let url = `${GMAILAPI}/${this.state.id}/messages/?pageToken=${this.state.nextPage}`
      axios.get(url, { headers: this.getAuthHeaders() })
        .then((emails) => {
          this.getNextEmails(emails.data.messages, emails.data.nextPageToken)
        })
        .catch((err) => {
          this.setState({ errorFlag: true, errorMessage: err })
        })
    }

    getNextEmails(emailIds, nextPageToken) {
      let promises = []
      let currentEmails = this.state.emails
      _.forEach(emailIds, (id) => {
        let url = `${GMAILAPI}/${this.state.id}/messages/${id.id}`
        promises.push(axios.get(url, { headers: this.getAuthHeaders() }))
      })
      Promise.all(promises)
        .then((res) => {
          let combined = _.concat(currentEmails, res)
          this.setState({ emails: combined, nextPage: nextPageToken })
        })
        .catch((err) => {
          console.log(err)
        })
    }

    emailLoadingMessage() {
      return (
        <h2 id='emailLoading' key={1}> Loading... </h2>
      )
    }

    getAttachments() {
      let attachments = []
      if(this.state.selectedNum === -1) {
        return attachments
      }
      let data = this.state.emails[this.state.selectedNum].data.payload.parts
      _.forEach(data, (payload) => {
        if(payload.filename && payload.filename.length > 0) {
          attachments.push(payload)
        }
      })

      return attachments
    }

    getMessageId() {
      if(this.state.selectedNum === -1) return -1
      return this.state.emails[this.state.selectedNum].data.id
    }

    render() {
      if(!this.state.loadingFlag) {
        return <h2 className='loading'>Loading...</h2>
      }
      return (
        <div>
          <ErrorMessage
            errorFlag={ this.state.errorFlag }
            errorMessage={ this.getErrorMessage() }
          />
          <div id='body'>
            <h1 id='title'>
                Email Analysis- Pick an email to analyze headers and attachments!
            </h1>
            <h2 id='intro'>Hello, { this.state.name }!</h2>
            <div id='emailBox'>{ this.getInfiniteScrollers() }</div>
            <Map headers={ this.state.selectedHeaders }/>
            <Attachments
              attachments={ this.getAttachments() }
              messageId={ this.getMessageId() }
              token={ this.props.token }
              id={ this.state.id }
            />
          </div>
        </div>
      )
  }
}

export default Gmail
