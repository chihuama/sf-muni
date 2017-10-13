import React, { Component } from 'react';
import * as d3 from "d3";

import Select from 'react-select';
import 'react-select/dist/react-select.css';


class RouteSelector extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            disabled: false,
			stayOpen: false,
            value: [],
            options: [],
        }

        // pass the properties
        this.routeList = props.routeList;    
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {
        this.routeList = nextProps.routeList;   
        
        // alias this -> that
        let that = this;
        
        // add the route list into the options
        let options = [{label: "All routes", value: "all"}];
        Object.keys(this.routeList).sort().forEach(function(tag) {
            let option = {};
            option.label = that.routeList[tag].title;
            option.value = tag;
        
            options.push(option);
        });
        
        // update the options
        this.setState({options});
    }
    
    // update the selections
    handleSelectChange (value) {
        console.log('You\'ve selected:', value);
        let selectRoutes = value.split(",");

        if (value === "all") {  // display all buses
            Object.keys(this.routeList).forEach(function(tag) {
                d3.select(".route-" + tag).style("display", "block");
            });            
        } else {  // only display the buses on the selected routes
            Object.keys(this.routeList).forEach(function(tag) {
                d3.select(".route-" + tag).style("display", "none");
            });
            
            selectRoutes.forEach(function(route) {
                d3.select(".route-" + route).style("display", "block");
            });
        }

		this.setState({ value });
	}


    render() {
        /* reference: https://github.com/JedWatson/react-select */
        let { options, disabled, stayOpen, value } = this.state;
        
        return (
            <div className="section">
                <Select
                    closeOnSelect={!stayOpen}
                    disabled={disabled}
                    multi
                    onChange={this.handleSelectChange.bind(this)}
                    options={options}
                    placeholder="Select the route(s)"
                    simpleValue
                    value={value}
                />
            </div>
        );
    }

}

export default RouteSelector;