/* eslint-disable no-undef */

import React, {Component} from 'react'
import {withGoogleMap, GoogleMap, Marker, Polyline} from 'react-google-maps'
import {MarkerWithLabel} from 'react-google-maps/lib/components/addons/MarkerWithLabel'
import MapStyles from './mapstyles.json';

class Map extends Component {
    constructor() {
        super()
        this.state = {
            loadingFlag: true
        }
        navigator.geolocation.getCurrentPosition(this.getPosition.bind(this))
    }

    getPosition(position) {
        console.log("??????????")
        console.log(position)
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

    getGoogleMap() {
        let positions = [
            {lat: this.state.lat, lng: this.state.lng},
            {lat: this.state.lat+0.01, lng: this.state.lng+0.01},
            {lat: this.state.lat-0.01, lng: this.state.lng-0.01}
        ]
        const GoogleMapInstance = withGoogleMap(props => (
            <GoogleMap
                defaultCenter={ { lat: this.state.lat, lng: this.state.lng } }
                defaultZoom={ 13 }
                defaultOptions={ { styles: MapStyles } }
            >
                <Marker position={ { lat: this.state.lat, lng: this.state.lng }}/>
                <Marker position={ { lat: this.state.lat+0.01, lng: this.state.lng+0.01 }}/>
                <Marker position={ { lat: this.state.lat-0.01, lng: this.state.lng-0.01 }}/>
                <Polyline path={positions} options={ this.getPolyLineStyle() }/>
            </GoogleMap>
        ))

        return GoogleMapInstance
    }


    getContainerStyles() {
        return {
            height: '600px',
            width: '600px'
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

    render() {
        console.log(google)
        if(this.state.loadingFlag) {
            return <h2>Loading...</h2>
        }
        let GoogleMapInstance = this.getGoogleMap()
        return (
            <div>
                <GoogleMapInstance
                    containerElement={ this.getContainerDiv() }
                    mapElement={ this.getMapElementDiv() }
                />
            </div>
        )
    }
}

export default Map
