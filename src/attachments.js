import './attachments.css'
import axios from 'axios'
import React, {Component} from 'react'
import config from './config'

const GMAILAPI = 'https://www.googleapis.com/gmail/v1/users'
const VIRUSTOTALURL = 'https://www.virustotal.com/vtapi/v2/file/scan'
const VIRUSREPORTURL = 'https://www.virustotal.com/vtapi/v2/file/report'

class Attachments extends Component {
  constructor(props) {
    super(props)
    this.state = {
      virusAnalysis: [],
      buttonFlags: [],
      timerIds: [],
      loadingFlags: []
    }
  }

  componentWillReceiveProps(nextProps) {
    let virusAnalysis = this.initializeAnalysis(nextProps.attachments)
    let buttonFlags = this.getFlags(nextProps.attachments)
    let timerIds = this.getTimerIds(nextProps.attachments)
    let loadingFlags = this.getLoadingFlags(nextProps.attachments)

    this.setState({ virusAnalysis, buttonFlags, timerIds, loadingFlags })
  }

  initializeAnalysis(attachments) {
    return attachments.map((attachment) => {
      return <div></div>
    })
  }

  getFlags(attachments) {
    return attachments.map((attachment) => {
      return true
    })
  }

  getTimerIds(attachments) {
    return attachments.map((attachment) => {
      return -1
    })
  }

  getLoadingFlags(attachments) {
    return attachments.map((attachment) => {
      return false
    })
  }

  getAttachments() {
    if(this.props.attachments.length === 0) {
      return <div> No attachments! </div>
    }
    return this.props.attachments.map((attachment, index) => {
      let button = null
      if(this.state.buttonFlags[index])
        button = this.getButton(attachment, index)
      let loadingFlag = this.state.loadingFlags[index]
      return (
        <div>
          <div className='fileInfo'>
            Filename: { attachment.filename } Type: { attachment.mimeType }
          </div>
          <br/>
          { button }
          { loadingFlag ? this.getLoadingDiv() : this.state.virusAnalysis[index] }
        </div>
      )
    })
  }

  getLoadingDiv() {
    return (
      <div className='loadingDiv'>Scanning...</div>
    )
  }

  getButton(attachment, index) {
    return (
      <button className='analyzeButton' onClick={
          this.getFileData.bind(this, attachment, index)
      }>
        Analyze for Viruses
      </button>
    )
  }

  getFileData(attachment, index) {
    let attachmentId = attachment.body.attachmentId

    let flags = this.state.buttonFlags
    let loadingFlags = this.state.loadingFlags
    flags[index] = false
    loadingFlags[index] = true
    this.setState({ buttonFlags: flags })

    let url = `${GMAILAPI}/${this.props.id}/messages/${this.props.messageId}/attachments/${attachmentId}`
    axios.get(url, {headers: this.getHeaders()})
      .then((res) => {
        let data = res.data.data
        data = data.replace(/-/g, "+").replace(/_/g, '/')
        let decoded = atob(data)
        this.analyzeFile(decoded, index)
      })
  }

  analyzeFile(fileData, index) {
    let vm = this
    var data = new FormData()
    data.append("apikey", config.virusTotal)
    data.append("file", fileData)

    var xhr = new XMLHttpRequest()
    xhr.withCredentials = true

    xhr.open("POST", VIRUSTOTALURL)
    xhr.setRequestHeader("cache-control", "no-cache")
    xhr.setRequestHeader("postman-token", "6cf7347f-b611-74d2-c1bf-8a379159f0f0")

    xhr.send(data)

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        let res = JSON.parse(this.responseText)
        vm.getReport(res.sha256, index)
      }
    })
  }

  getReport(resource, index) {
    let vm = this
    var data = new FormData()
    var xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    xhr.open("GET", `${VIRUSREPORTURL}?apikey=${config.virusTotal}&resource=${resource}`)
    xhr.send(data)

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        let res = JSON.parse(this.responseText)
        if(res.response_code === 1) {
          let loadingFlags = vm.state.loadingFlags
          loadingFlags[index] = false
          vm.setState({ loadingFlags })
          vm.getStatus(res, index)
        } else {
          vm.createTimer(resource, index)
        }
      }
    })
  }

  createTimer(resource, index) {
    let timerIds = this.state.timerIds
    let id = setInterval(this.updateReport.bind(this, resource, index), 10000)
    timerIds[index] = id
    console.log("timer id", id)
    this.setState({ timerIds })
  }

  updateReport(resource, index) {
    let vm = this
    var data = new FormData()
    var xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    xhr.open("GET", `${VIRUSREPORTURL}?apikey=${config.virusTotal}&resource=${resource}`)
    xhr.send(data)

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        let res = JSON.parse(this.responseText)
        if(res.response_code === 1) {
          let timerIds = vm.state.timerIds
          clearInterval(timerIds[index])
          let loadingFlags = vm.state.loadingFlags
          loadingFlags[index] = false
          vm.setState({ loadingFlags })
          vm.getStatus(res, index)
        }
      }
    })
  }

  getStatus(scans, index) {
    let virusAnalysis = this.state.virusAnalysis
    let scanResults = Object.keys(scans.scans).map((key) => {
      return (
        <div id='analysisDiv'>
          <div className='scanner'>{ key }</div>
          { this.getDetected(scans.scans[key].detected) }
          { this.getResult(scans.scans[key].result) }
        </div>
      )
    })

    virusAnalysis[index] = (
      <div>
        <div className='checkOutDiv'>
          Check out the report here:
          <a className='permalink' target='_blank' href={scans.permalink}>Report</a>
        </div>
        <div className='hash'>SHA256 Hash: {scans.sha256}</div>
        { scanResults }
      </div>
    )

    this.setState({ virusAnalysis })
  }

  getDetected(flag) {
    if(!flag) {
      return (
        <div className='goodText'>Good!</div>
      )
    }
    return (
      <div className='badText'>Bad!</div>
    )
  }

  getResult(result) {
    if(!result) {
      return (
        <div className='goodResult'>Result(s): Nothing!</div>
      )
    }
    return (
      <div className='badResult'>Result(s): {result}!</div>
    )
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.props.token}`
    }
  }

  render() {
    return (
      <div id='attachments'>
        { this.getAttachments() }
      </div>
    )
  }
}

export default Attachments
