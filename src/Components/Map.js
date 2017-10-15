import React, { Component } from 'react';
import * as d3 from "d3";

import axios from 'axios';

import MapLayer from "./MapLayer";
import BusLayer from "./BusLayer";
import RouteSelector from "./RouteSelector";


class Map extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            routes: {},
            selectedRoutes: ["all"],            
        };     
        
        // store variables from class properties
        this.neighborhoods = props.neighborhoods;
        this.freeways = props.freeways;
        this.arteries = props.arteries;        
        this.streets = props.streets;
        this.routeList = props.routeList;

        // set the map size
        this.width = 1080;
        this.height = 720;
        
        this.routesSelect = this.routesSelect.bind(this);   

        // pan and zoom using d3.zoom()
        this.zoom = d3.zoom()
            .scaleExtent([1 / 2, 8])
            .translateExtent([[0, 0], [this.width, this.height]])
            .on("zoom", function () {
                d3.select(this).attr("transform", d3.event.transform)
            });
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

    // update the selected routes -> RouteSelector and BusLayer will re-render
    routesSelect(selectedRoutes) {
        this.setState({ selectedRoutes });
    }    

    render() {
        console.log(this.routeList);

        return (
            <div>
                <RouteSelector routeList={this.state.routes} selectedRoutes={this.state.selectedRoutes} handleSelectChange={this.routesSelect} />
                <svg width={this.width} height={this.height} style={{border:"2px solid gray"}}>
                    <g className="mapLayers" ref={node => d3.select(node).call(this.zoom)}>
                        {/* four layers of different type of maps */}
                        <MapLayer data={this.neighborhoods} width={this.width} height={this.height} strokeColor={"darkgray"} strokeWidth={1} fillColor={"lightgray"} />
                        <MapLayer data={this.arteries} width={this.width} height={this.height} strokeColor={"white"} strokeWidth={4} fillColor={"none"} />
                        <MapLayer data={this.streets} width={this.width} height={this.height} strokeColor={"white"} strokeWidth={2} fillColor={"none"} />   
                        <MapLayer data={this.freeways} width={this.width} height={this.height} strokeColor={"#fdae61"} strokeWidth={6} fillColor={"none"} />     
                        <BusLayer data={this.state.routes} streetsJson={this.streets} width={this.width} height={this.height} selectedRoutes={this.state.selectedRoutes} />
                    </g>                        
                </svg>
            </div>
        );
    }

}

export default Map;