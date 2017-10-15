import React, { Component } from 'react';
import * as d3 from "d3";

import axios from 'axios';


class BusLayer extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            busesAtRoutes: {},
        };

        // store variables from class properties
        this.routes = props.data;  
        this.geoJson = props.streetsJson;        
        this.width = props.width;
        this.height = props.height;
        this.selectedRoutes = props.selectedRoutes;

        this.routeOpacity = {};
    }

    loadData() {
        // alias this -> that
        let that = this; 

        // create an array to store the active buses for each route
        Object.keys(this.routes).map((routeTag) => this.routes[routeTag].vehicleList = []);
        
        let currentTime = Date.now();
        console.log(currentTime);

        // get the active buses info on each route from the server
        Promise.all(Object.keys(this.routes).map((routeTag) => axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=" + routeTag + `&t=${currentTime - 10000}`)))          
            .then(function(responses) {
                // scan for each route
                responses.forEach(function(response) {
                    // if this route has vehicles
                    if (response.data.vehicle) {  
                        let vehicles = response.data.vehicle;

                        // get lat & lon of each vehicle on this route
                        if (Array.isArray(vehicles)) {  // multiple vehicles
                            vehicles.forEach(function(vehicle) {                             
                                // ignore the vehicles without route assicated or unpredictable
                                let vehicleInfo = {};
                                // if (vehicle.routeTag && vehicle.predictable) {
                                    if (vehicle.routeTag) {                                        
                                    vehicleInfo.id = vehicle.id;
                                    vehicleInfo.lat = vehicle.lat;
                                    vehicleInfo.lon = vehicle.lon;                                    
                                    // add the vehicle info (id, lat & lon) into the vehicle list
                                    that.routes[vehicle.routeTag].vehicleList.push(vehicleInfo);                                  
                                }
                            });
                        } else {  // only one vehicle
                            // ignore the vehicle without route assicated or unpredictable
                            // if (vehicles.routeTag && vehicles.predictable) {
                            if (vehicles.routeTag) {                                
                                let vehicleInfo = {};
                                vehicleInfo.id = vehicles.id;
                                vehicleInfo.lat = vehicles.lat;
                                vehicleInfo.lon = vehicles.lon;
                                // add the vehicle info (id, lat & lon) into the vehicle list
                                that.routes[vehicles.routeTag].vehicleList.push(vehicleInfo);                                  
                            }
                        }
                    }
                });

                that.setState({busesAtRoutes: that.routes});
                console.log("Got vehicles info");
            })
            .catch(function(err) {
                console.log(err)
            });
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {         
        let that = this;  
    
        this.routes = nextProps.data;  // an object
        this.selectedRoutes = nextProps.selectedRoutes;  // an array

        if (this.selectedRoutes.includes("all")) {  // display all buses
            Object.keys(this.routes).map((routeTag) => this.routeOpacity[routeTag] = 1);        
        } else {  // only display the buses on the selected routes
            Object.keys(this.routes).map((routeTag) => this.routeOpacity[routeTag] = 0); 
            if (this.selectedRoutes[0] !== "") {
                this.selectedRoutes.map((routeTag) => this.routeOpacity[routeTag] = 1);                        
            }
        }   
        // console.log(this.routeOpacity);

        // call loadData & setInterval only when this.routes is loaded w/ routes info
        if (Object.keys(this.routes).length > 0) {            
            // only call the setInterval func once
            if (!this.dataInterval) {
                this.loadData();
                
                this.dataInterval = setInterval(function() {
                    that.loadData();
                }, 15000);
            }     
        }
    }
    

    render() {
        console.log(this.state.busesAtRoutes);

        // alias this -> that
        let that = this;
        
        let projection = d3.geoAlbersUsa()
            .fitSize([this.width, this.height], this.geoJson);

        let routes = [];
        // scan for each route        
        routes = Object.keys(this.state.busesAtRoutes).map(function(tag) {
            // get the vehichel list of this route
            let vehicles = that.state.busesAtRoutes[tag].vehicleList;
            // update the style based on the color of this route
            let style = {stroke: "none", fill: "#" + that.state.busesAtRoutes[tag].color, opacity: that.routeOpacity[tag] };

            let buses = [];
            buses = vehicles.map(function(vehicle) {
                // get the x/y coordinate for each bus
                let coordinate = projection([vehicle.lon, vehicle.lat]);
                
                return (<circle
                    cx={coordinate[0]}
                    cy={coordinate[1]}
                    r={3}
                    style={style}
                    key={tag + "-" + vehicle.id}
                />);
            });

            return (
                <g className={"route-" + tag}>{buses}</g>
            );
        });        

        return (
            <g className="allBuses">{routes}</g>
        );
    }

}

export default BusLayer;