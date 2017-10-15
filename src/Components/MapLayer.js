import React, { Component } from 'react';
import * as d3 from "d3";


class MapLayer extends React.Component {

    constructor(props) {
        super(props);
        
        // store variables from class properties
        this.geoJson = props.data;

        this.width = props.width;
        this.height = props.height;
        
        this.strokeColor = props.strokeColor;
        this.strokeWidth = props.strokeWidth;
        this.fillColor = props.fillColor;
    }
    
    // only render the MapLayer once
    shouldComponentUpdate() {
        return false;
    }

    render() {
        console.log(this.geoJson);
        
        // alias this -> that
        let that = this;

        let projection = d3.geoAlbersUsa()
          .fitSize([this.width, this.height], this.geoJson);

        let geoGenerator = d3.geoPath()
          .projection(projection);

        let features = this.geoJson.features.map(function(feature, i) {
            let style = {stroke: that.strokeColor, strokeWidth: that.strokeWidth, fill: that.fillColor};

            return (<path 
              d={geoGenerator(feature)}
              style={style}
              key={i}
            />)
        });

        return (
            <g className="map">{features}</g>
        );
    }

}

export default MapLayer;