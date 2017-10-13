import React, { Component } from 'react';
import * as d3 from "d3";

import axios from 'axios';

import MapLayer from "./MapLayer";
import BusLayer from "./BusLayer";


class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // value: null,
            routes: {},
        };
        
        // pass the properties
        this.neighborhoods = props.neighborhoods;
        this.freeways = props.freeways;
        this.arteries = props.arteries;        
        this.streets = props.streets;

        this.routeList = props.routeList;

        // set the map size
        this.width = 1200;
        this.height = 800;
        
        // set the initial zoom level
        this.zoom = 1;
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {
        this.neighborhoods = nextProps.neighborhoods;
        this.freeways = nextProps.freeways;
        this.arteries = nextProps.arteries;        
        this.streets = nextProps.streets;

        this.routeList = nextProps.routeList;
        
        // alias this -> that
        let that = this;

        let routes = {};
        
        // get the each route info from the server
        Promise.all(this.routeList.map((route) => axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=sf-muni&r=" + route.tag)))
            .then(function(responses){
                // get the detailed info from each route, e.g., color                
                responses.forEach(function(response) {
                    // use the route tag as the key
                    routes[response.data.route.tag] = {};  // e.g., E
                    routes[response.data.route.tag].title = response.data.route.title;  // e.g., E-Embarcadero
                    routes[response.data.route.tag].color = response.data.route.color;  // e.g., #667744 
                });
                // update the routes info (w/ color) in the state
                that.setState({routes});
            });
    }
    
    // zoom in/out the map
    scrolled(e) {
        e.preventDefault();

        let zoomIncrement = 0.1;

        if (e.deltaY > 0) {
            this.zoom -= zoomIncrement;            
        } else {
            this.zoom += zoomIncrement;
        }

        d3.select(".mapLayers").attr("transform", `scale(${this.zoom})`);
    }

    
    render() {
        console.log(this.routeList);

        return (
            <svg width={this.width} height={this.height} onWheel={this.scrolled.bind(this)}>
                <g className="mapLayers" transform={`scale( ${this.zoom} )`}>
                    {/* four layers of different type of maps */}
                    <MapLayer data={this.neighborhoods} width={this.width} height={this.height} strokeColor={"darkgray"} strokeWidth={1} fillColor={"lightgray"} />
                    <MapLayer data={this.arteries} width={this.width} height={this.height} strokeColor={"white"} strokeWidth={4} fillColor={"none"} />
                    <MapLayer data={this.streets} width={this.width} height={this.height} strokeColor={"white"} strokeWidth={2} fillColor={"none"} />   
                    <MapLayer data={this.freeways} width={this.width} height={this.height} strokeColor={"#fdae61"} strokeWidth={6} fillColor={"none"} />     
                    <BusLayer data={this.state.routes} streetsJson={this.streets} width={this.width} height={this.height} />
                </g>                        
            </svg>
        );
    }

}

export default Map;