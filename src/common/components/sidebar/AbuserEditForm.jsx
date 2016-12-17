import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';
import Axios from 'axios';
import dateFormat from 'dateFormat';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');



export default class CasefileEditModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      nationality: [],
      relationships: [],
      
      abuser: {},
      editedAbuser: {}
    }
    this.getDataOptions = this.getDataOptions.bind(this);
  }

  componentDidMount() {
    this.getAbuser(this.props.casefile.pk);
    this.getDataOptions();
  }

  getAbuser = ((pk) => {
    const axios = Axios;
    axios({
      method: 'get',
      url: Constants.API_URL + '/abusers/'+pk+'/',
      headers: {'Authorization': Cookie.getCookie('token')}
    })
    .then((response) => {
      this.setState({casefile:response.data});
    })
    .catch((error) => {
      console.log(error.data);
    });
  })

  getDataOptions() {
    const axios = Axios;

    function getNationalities() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/nationalities/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getRelationships() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/relationships/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

  
    axios.all([getNationalities(), getRelationships()])
    .then(axios.spread(function (n, r) {
      var nationalities = n.data.results.map(n => <option key={n.pk} value={n.pk}>{n.type}</option>);
      var relationships = r.data.results.map(r => <option key={r.pk} value={r.pk}>{r.type}</option>);

      this.setState({ nationalities: nationalities, relationships: relationships});
    }.bind(this)))

  }
  

  handleChange(e) {
    const id = e.target.id;
    const value = e.target.value;
    if(e.target.type == 'checkbox') {
      e.target.checked ? this.state.editedCasefile[id]=true : this.state.editedCasefile[id]=false;
    } else if (e.target.type=='select-multiple') {
      var selected = this.getMultipleSelectedOptions(e.target);
      this.state.editedCasefile[id] = selected;
    } else if (e.target.type=='select-one') {
      if (id == 'risk_at_referral' || id == 'risk_at_closure') {
        this.state.editedCasefile[id] = value;
      } else {
        this.state.editedCasefile[id] = {'pk': value};  
      }
    } else {
     this.state.editedCasefile[id] = value;
    }
  }


  getMultipleSelectedOptions(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push({'pk':parseInt(opt.value)});
      }
    }

    return result;
  }


  postEditedAbuser() {
    // console.log(this.state.editedCasefile);
    const axios = Axios;
    var casefile = this.state.casefile;
    
    //Send info without the file first to get the casenote id
    axios({
      method: 'patch',
      url: Constants.API_URL + '/casefiles/'+this.props.casefile.pk+'/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : this.state.editedCasefile
    })
    .then(function(response) {
      if (response.status==200) {        
        //Close Form and refresh data
        this.props.onAdd();
      } 
    }.bind(this))
    .catch(function(error) {
      alert('Unable to edit Case File.');
      console.log(error.response.status);
      console.log(error.response.data);
    })
    
  }

  render() {

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Edit Case File Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form encType="multipart/form-data" id='editcasefielform'>
            <FormGroup controlId="first_name">
              <ControlLabel>Abuser Frist Name</ControlLabel>
              <FormControl type="text" onChange={this.handleChange} defaultValue={this.props.abusers.first_name}/>
            </FormGroup>
            <FormGroup controlId="last_name">
              <ControlLabel>Abuser Last Name</ControlLabel>
              <FormControl type="text" onChange={this.handleChange} defaultValue={this.props.abusers.last_name}/>
            </FormGroup>
            <FormGroup controlId="nationality">
              <ControlLabel>Nationality</ControlLabel>
              <FormControl defaultValue={this.props.abuser.nationality} componentClass="select" onChange={this.handleChange}>
                {this.state.nationality}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="relationship_to_client">
              <ControlLabel>Relationship to Client</ControlLabel>
              <FormControl defaultValue={this.props.abuser.relationship_to_client} componentClass="select" onChange={this.handleChange}>
                {this.state.relationship_to_client}
              </FormControl>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.postEditedAbuser}>Save</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}