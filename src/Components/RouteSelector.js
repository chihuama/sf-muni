import React, { Component } from 'react';

import Select from 'react-select';
import 'react-select/dist/react-select.css';


class RouteSelector extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            disabled: false,
            stayOpen: false,
            options: [],
        }

        // store route list from class properties
        this.routeList = props.routeList;   
        
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    // update object with new properties
    componentWillReceiveProps(nextProps) {
        /* assume the route list doesn't change, 
           so only store the route list and add it to the options once */
        if (this.routeList !== nextProps.routeList) {
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
    }
    
    // update the selections
    handleSelectChange (value) {
        this.props.handleSelectChange(value.split(","));
	}


    render() {
        console.log(this.props.selectedRoutes);
        /* reference: https://github.com/JedWatson/react-select */
        let { disabled, stayOpen, options } = this.state;        
        
        return (
            <div className="section">
                <Select
                    closeOnSelect={!stayOpen}
                    disabled={disabled}
                    multi
                    onChange={this.handleSelectChange}
                    options={options}
                    placeholder="Select the route(s)"
                    simpleValue                
                    value={this.props.selectedRoutes}
                />
            </div>
        );
    }

}

export default RouteSelector;