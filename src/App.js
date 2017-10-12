import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';

import Map from './Map';

import neighborhoodsJson from "./maps/neighborhoods.json";
import freewaysJson from "./maps/freeways.json";
import arteriesJson from "./maps/arteries.json";
import streetsJson from "./maps/streets.json";


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      routes: [],
    }
  }

  componentDidMount() {
    // alias this -> that
    let that = this;
    
    // get the route list from the server
    axios.get("http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=sf-muni")
      // .then(res => {
      //   console.log(res);
      //   let routes = res.data.route;
      //   this.setState({routes});
      //   console.log(this.state.routes);  
      // });
      .then(function(res) {       
        // update the routes in the state
        that.setState({"routes": res.data.route});     
      });
  }


  render() {    
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Welcome to San Francisco Muni Tracker</h1>
        </header>
        <Map 
          neighborhoods={neighborhoodsJson}
          freeways={freewaysJson}
          arteries={arteriesJson}           
          streets={streetsJson}
          routeList={this.state.routes}
        />
      </div>
    );
  }

}

export default App;


// http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=sf-muni
// http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=sf-muni&r=N
// http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&r=N&t=1144953500233 (t=epochTime)

