import React, { Component } from 'react';
import * as d3 from "d3";

import axios from 'axios';


class BusLayer extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            routesBuses: {},
        };

        // pass the properties
        this.routes = props.data;  

        this.geoJson = props.streetsJson;        
        this.width = props.width;
        this.height = props.height;
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {        
        this.routes = nextProps.data;

        // let routesBuses = {};
        // create an array to store the active buses for each route
        Object.keys(this.routes).map((routeTag) => this.routes[routeTag].vehicleList = []);

        // alias this -> that
        let that = this;       
        
        // get the active buses info on each route from the server
        Promise.all(Object.keys(this.routes).map((routeTag) => axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=" + routeTag + "&t=1507785631")))
            .then(function(responses) {
                console.log(responses);
                // scan for each route
                responses.forEach(function(response) {
                    // if this route has vehicles
                    if (response.data.vehicle) {  
                        let vehicles = response.data.vehicle;

                        // get lat & lon of each vehicle on this route
                        if (Array.isArray(vehicles)) {  // multiple vehicles
                            vehicles.forEach(function(vehicle) {                             
                                // ignore the vehicles without route assicated or unpredictable
                                if (vehicle.routeTag && vehicle.predictable) {
                                    let vehicleInfo = {};
                                    vehicleInfo.id = vehicle.id;
                                    vehicleInfo.lat = vehicle.lat;
                                    vehicleInfo.lon = vehicle.lon;
                                    // add the vehicle info (id, lat & lon) into the vehicle list
                                    that.routes[vehicle.routeTag].vehicleList.push(vehicleInfo);                                  
                                }
                            });
                        } else {  // only one vehicle
                            // ignore the vehicle without route assicated or unpredictable
                            if (vehicles.routeTag && vehicles.predictable) {
                                let vehicleInfo = {};
                                vehicleInfo.id = vehicles.id;
                                vehicleInfo.lat = vehicles.lat;
                                vehicleInfo.lon = vehicles.lon;
                                // add the vehicle info (id, lat & lon) into the vehicle list
                                that.routes[vehicles.routeTag].vehicleList.push(vehicleInfo);                                  
                            }
                        }
                    } else {  // no vehicle on this route
                        // do nothing ...
                    }
                });

                that.setState({routesBuses: that.routes});
            })
            .catch(function(err) {
                console.log(err)
            });
    }

    render() {
        console.log(this.state.routesBuses);

        // alias this -> that
        let that = this;
        
        let projection = d3.geoAlbersUsa()
            .fitSize([this.width, this.height], this.geoJson);

        let buses = [];
        Object.keys(this.state.routesBuses).forEach(function(tag) {
        // let buses = Object.keys(this.state.routesBuses).map(function(tag) {

            let vehicles = that.state.routesBuses[tag].vehicleList;

            let style = {stroke: "none", fill: "#" + that.state.routesBuses[tag].color};
            // let style = {stroke: "none", fill: "red"};            

            buses = buses.concat(vehicles.map(function(vehicle) {
                // return vehicles.map(function(vehicle) {
                let coordinate = projection([vehicle.lon, vehicle.lat]);

                return (<circle
                    cx={coordinate[0]}
                    cy={coordinate[1]}
                    r={4}
                    style={style}
                    key={vehicle.id}
                />);
            }));
        });

        console.log(buses);

        return (
            <g className="activeBuses">{buses}</g>
        );
    }
}

export default BusLayer;