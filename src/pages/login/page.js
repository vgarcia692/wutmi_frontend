import React from 'react';
import { browserHistory } from 'react-router';
import { Row, Col, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import styles from './style.css';
import CustomAxios from '../../common/components/CustomAxios';
const Cookie = require('../../common/Cookie.js')
const axios = CustomAxios.wAxios;

export default class LoginPage extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {
        username: '',
        password: ''
      }
    }

    this.handleChange = this.handleChange.bind(this)
    this.login = this.login.bind(this)
    this.enterKeyLogin = this.enterKeyLogin.bind(this)
  }

  handleChange = ((e) => {
    const user = Object.assign({}, this.state.user);    
    const id = e.target.id;
    const value = e.target.value;
    user[id] = value;
    this.setState({ user });
  })

  login = (() => {
    axios.post('/api-token-auth/', {
      username: this.state.user.username,
      password: this.state.user.password
    })
    .then(function (response) {
      // Save Token to cookie
      var token = "Token " + response.data.token;
      Cookie.setCookie(token);
      // Add Token to axios default for every request
      axios.defaults.headers.common['Authorization'] = Cookie.getCookie('token');
      // // Go to home page
      browserHistory.push('/home/dashboard');
    })
    .catch(function (error) {
      alert('Unable to Login with usernae and password.');
      console.log(error);
    });
  })

  enterKeyLogin = ((e) => {
    var charCode = (typeof e.which === "number") ? e.which : e.keyCode;
    if (charCode == 13) {
      axios.post('/api-token-auth/', {
        username: this.state.user.username,
        password: this.state.user.password
      })
      .then(function (response) {
        // Save Token to cookie
      var token = "Token " + response.data.token;
      Cookie.setCookie(token);
      // Add Token to axios default for every request
      axios.defaults.headers.common['Authorization'] = Cookie.getCookie('token');
      // // Go to home page
      browserHistory.push('/home/dashboard');
      })
      .catch(function (error) {
        alert('Unable to Login with usernae and password.');
      });
    }
  })
  
  render() {
    return (
      <div className={styles.content}>
        <Row>
          <Col md={5} xsOffset={3}>
            <form>
            <h1>WUTMI WiM Database</h1>
            <br/>
            {/*<center><img src="https://s11.postimg.org/a1dxqmg2r/wutmilogo.png" height="300px" width="300px" className={styles.image}/></center>*/}
              <FormGroup controlId="username">
                <ControlLabel>Username</ControlLabel>
                <FormControl type="text" onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup controlId="password">
                <ControlLabel>Password</ControlLabel >
                <FormControl type="password" onChange={this.handleChange} onKeyUp={this.enterKeyLogin}/>
              </FormGroup>
            </form>
            <Button bsStyle="primary" onClick={this.login}>Login</Button>
          </Col>
        </Row>
      </div>
    );
  }
}
