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

    loadData() {
        // alias this -> that
        let that = this; 

        // create an array to store the active buses for each route
        Object.keys(this.routes).map((routeTag) => this.routes[routeTag].vehicleList = []);
        
        let currentTime = Date.now();
        console.log(currentTime);

        // get the active buses info on each route from the server
        // Promise.all(Object.keys(this.routes).map((routeTag) => axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=" + routeTag + `&t=${currentTime - 10000}`)))  
        Promise.all(Object.keys(this.routes).map((routeTag) => axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=" + routeTag + "&t=1507911292859")))                  
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

                that.setState({routesBuses: that.routes});
                console.log("done");
            })
            .catch(function(err) {
                console.log(err)
            });
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {        
        this.routes = nextProps.data;

        setInterval(this.loadData.bind(this), 15000);          
    }
    

    render() {
        console.log(this.state.routesBuses);

        // alias this -> that
        let that = this;
        
        let projection = d3.geoAlbersUsa()
            .fitSize([this.width, this.height], this.geoJson);

        // let buses = [];
        
        // // scan for each route
        // Object.keys(this.state.routesBuses).forEach(function(tag) {
        //     // get the vehichel list of this route
        //     let vehicles = that.state.routesBuses[tag].vehicleList;
        //     // update the style based on the color of this route
        //     let style = {stroke: "none", fill: "#" + that.state.routesBuses[tag].color};   

        //     buses = buses.concat(vehicles.map(function(vehicle) {
        //         // get the x/y coordinate for each bus
        //         let coordinate = projection([vehicle.lon, vehicle.lat]);

        //         return (<circle
        //             cx={coordinate[0]}
        //             cy={coordinate[1]}
        //             r={3}
        //             style={style}
        //             key={tag + "-" + vehicle.id}
        //         />);
        //     }));
        // });

        let routes = [];
        // scan for each route        
        routes = Object.keys(this.state.routesBuses).map(function(tag) {
            // get the vehichel list of this route
            let vehicles = that.state.routesBuses[tag].vehicleList;
            // update the style based on the color of this route
            let style = {stroke: "none", fill: "#" + that.state.routesBuses[tag].color};

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

        Object.keys(this.state.routesBuses).forEach(function(tag) {
            d3.select(".route-" + tag).style("display", "none");
        });
        d3.select(".route-6").style("display", "block");
        


        // console.log(buses);

        return (
            // <g className="activeBuses">{buses}</g>
            <g className="activeBuses">{routes}</g>
        );
    }

}

export default BusLayer;