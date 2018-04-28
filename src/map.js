/* eslint-disable no-undef */
import _ from 'lodash'
import './map.css'
import {MarkerWithLabel} from 'react-google-maps/lib/components/addons/MarkerWithLabel'
import {withGoogleMap, GoogleMap, Polyline} from 'react-google-maps'
import MapStyles from './mapstyles.json'
import React, {Component} from 'react'
import axios from 'axios'
import config from './config'

class Map extends Component {
    constructor(props) {
      super(props)
      this.state = {
        loadingFlag: true,
        positions: [],
        locations: [],
        headers: null
      }
      navigator.geolocation.getCurrentPosition(this.getPosition.bind(this))
    }

    componentWillReceiveProps(nextProps) {
      this.setState({ headers: nextProps.headers, locations: [], positions: [] })
      if(!this.state.loadingFlag) this.getPositions(nextProps.headers)
    }

    getPosition(position) {
      this.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        loadingFlag: false
      })
    }

    getPolyLineStyle() {
      return {
        strokeColor: '#fff600',
        strokeOpacity: 0.9,
        strokeWeight: 4
      }
    }

    getLabelAnchor() {
      return new google.maps.Point(0,0)
    }

    getLabelStyle() {
      return {
        backgroundColor: '#fff600',
        padding: '10px',
        fontSize: '12px',
        width: '130px',
        height: '70px'
      }
    }

    getGoogleMap() {
      const GoogleMapInstance = withGoogleMap(props => (
        <GoogleMap
          defaultCenter={ { lat: this.state.lat, lng: this.state.lng } }
          defaultZoom={ 5 }
          defaultOptions={ { styles: MapStyles } }
        >
          { this.getAllMarkerLabels() }
          { this.getPolyLine() }
        </GoogleMap>
      ))

      return GoogleMapInstance
    }

    getAllMarkerLabels() {
      let locations = this.state.locations
      let found = _.find(locations, (location) => { return location.name === 'Me'})
      if(!found) locations.push({ lat: this.state.lat, lng: this.state.lng, name: 'Me' })

      return locations.map((location, index) => {
        return (
          <MarkerWithLabel
            key={index}
            position={ { lat: location.lat, lng: location.lng } }
            labelAnchor={ this.getLabelAnchor() }
            labelStyle={ this.getLabelStyle() }
          >
            <div>
              Hop: {index}. Name: {location.name} <br/>
              lat: { this.state.lat }, lng: { this.state.lng }
            </div>
          </MarkerWithLabel>
        )
      })
    }

    getPolyLine() {
      let locations = this.state.locations
      let positions = locations.map((location) => {
        return { lat: location.lat, lng: location.lng }
      })
      return (
        <Polyline path={positions} options={ this.getPolyLineStyle() }/>
      )
    }

    getPositions(headers) {
      let promises = []
      if(headers !== null) {
        _.forEachRight(headers, (header) => {
          if(header.name === 'Received' && header.value[0] === 'f'){
            promises.push(this.getHeaderInfo(header))
          }
        })
      }
      if(promises.length !== 0) {
        this.resolveAllPositionPromises(promises)
      }
    }

    resolveAllPositionPromises(promises) {
      Promise.all(promises)
        .then((res) => {
          let positions = []
          _.forEach(res, (position) => {
            if(position.fromData) positions.push(position.fromData)
            else positions.push(position.altFrom)
            positions.push(position.to)
          })
          this.getLocations(positions)
        })
    }

    getLocations(positions) {
      let promises = []
      _.forEach(positions, (position) => {
        promises.push(this.geolocate(position))
      })

      this.resolveAllLocationPromises(promises, positions)
    }

    resolveAllLocationPromises(promises, positions) {
      Promise.all(promises)
        .then((res) => {
          let locations = []
          _.forEach(res, (location, index) => {
            if(location.data.longitude && location.data.latitude) {
              locations.push({
                lat: location.data.latitude,
                lng: location.data.longitude,
                name: positions[index]
              })
            }
          })
          this.setState({ locations })
        })
        .catch((err) => console.log(err))
    }

    getHeaderInfo(header) {
      let splitData = header.value.split(' ')
      _.remove(splitData, (data) => data === '')

      let fromData = this.stripCharacters(splitData[2])
      let altFrom = this.stripCharacters(splitData[1])
      let index = _.findIndex(splitData, (word) => word === 'by')
      let to = this.stripCharacters(splitData[index+1])

      return this.geolocate(fromData)
        .then((res) => {
          if(res.longitude && res.latitude) {
            return Promise.resolve({ fromData, to })
          }
          return Promise.resolve({ altFrom, to })
        })
        .catch((err) => console.log(err))
    }

    geolocate(location) {
      let url = `http://api.ipstack.com/${location}?access_key=${config.ipStack}&output=json`
      return axios.get(url)
    }

    stripCharacters(word) {
      word = word.replace('(', '')
      word = word.replace('[', '')
      word = word.replace(')', '')
      word = word.replace(']', '')
      return word
    }

    getContainerStyles() {
      return {
        height: '600px',
        width: '650px'
      }
    }

    getContainerDiv() {
      let styles = this.getContainerStyles()

      return (
        <div style={ styles }></div>
      )
    }

    getMapElementStyle() {
      return {
        height: '100%'
      }
    }

    getMapElementDiv() {
      let styles = this.getMapElementStyle()

      return (
        <div style={ styles }></div>
      )
    }

    getLoadingElementStyle() {
      return {
        height:' 100%'
      }
    }

    getLoadingElementDiv() {
      let styles = this.getLoadingElementStyle()

      return (
        <div style={ styles }></div>
      )
    }

    getListOfLocations() {
      let locations = this.state.locations
      locations.push({ lat: this.state.lat, lng: this.state.lng, name: 'Me' })
      let list = locations.map((location, index) => {
        return (
          <li key={index}>
            Name: { location.name } <br/>
            Longitude: { location.lng }, Latitude: { location.lat }
          </li>
        )
      })
      return (
        <div id='headersList'>
          Hops:
          <ol> { list } </ol>
        </div>
      )
    }

    getRelevantHeaders() {
      let headers = this.state.headers
      if(!headers) return null

      let values = []
      _.forEachRight(headers, (header) => {
        if(header.name === 'Received' && header.value[0] === 'f'){
          values.push(
            <li key={header.value}>
              { header.value }
            </li>
          )
        }
      })
      return (
        <div id='headersList'>
          Headers:
          <ol>{ values }</ol>
        </div>
      )
    }

    render() {
      if(this.state.loadingFlag) {
        return <h2 className='mapLoading'>Loading...</h2>
      }
      let GoogleMapInstance = this.getGoogleMap()
      return (
        <div id='mapDiv'>
          <GoogleMapInstance
            containerElement={ this.getContainerDiv() }
            mapElement={ this.getMapElementDiv() }
          />
          { this.getListOfLocations() }
          { this.getRelevantHeaders() }
        </div>
      )
    }
}

export default Map

// gmail client id: 505532977879-0bbfrj8bcbscj7nflulcp9h1amok0vkh.apps.googleusercontent.com
