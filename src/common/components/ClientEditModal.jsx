import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock, Well } from 'react-bootstrap';
import Axios from 'axios';
import dateFormat from 'dateFormat';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');



export default class ClientEditModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      nationalities: [],
      atolls: [],
      religions: [],
      disabilities: [],
      
      client: {},
      editedClient: {},
      currentChildrenIds: [],
      editedChildren: []
    }
    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.postEditedClient = this.postEditedClient.bind(this);
  }

  componentDidMount() {
    this.setState({ client: this.props.client })
    this.getDataOptions();
  }

  getDataOptions() {
    const axios = Axios;

    function getNationalities() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/nationalities/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getAtolls() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/atolls/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getReligions() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/religions/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getDisabilities() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/disabilities/',
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

  
    axios.all([getNationalities(), getAtolls(), getReligions(), getDisabilities(), getRelationships()])
    .then(axios.spread(function (n, a, r, d, re) {
      var nationalities = n.data.results.map(n => <option key={n.pk} value={n.pk}>{n.type}</option>);
      var atolls = a.data.results.map(a => <option key={a.pk} value={a.pk}>{a.name}</option>);
      var religions = r.data.results.map(r => <option key={r.pk} value={r.pk}>{r.type}</option>);
      var disabilities = d.data.results.map(d => <option key={d.pk} value={d.pk}>{d.type}</option>);
      var relationships = re.data.results.map(re => <option key={re.pk} value={re.pk}>{re.type}</option>);

      this.setState({ nationalities: nationalities, atolls: atolls, religions: religions, disabilities:disabilities, relationships:relationships});
    }.bind(this)))

  }
  

  handleChange(e) {
    const id = e.target.id;
    const value = e.target.value;
    // If Children
    if(id.includes('child')) {
      var editedChildren = this.state.editedChildren;
      // Get id
      var childId = parseInt(e.target.id.split("-")[1]);
      // Get key
      var childKey = e.target.id.split("-")[2];
      // Attach child object the id
      var newChild = {pk:childId};
      // console.log('current editing child id:' + newChild.pk)
      // Get any child currently being updated
      var selectedChild = this.state.editedChildren.filter(function(obj) {
        return obj.pk == newChild.pk;
      })
      // If child not already in list or a new child for updating
      if (selectedChild.length > 0) {
        var index = this.state.editedChildren.map(function(child, index) {
          if (child.pk == selectedChild[0].pk) {
            return index;
          }
        }).filter(isFinite)
        
        if (e.target.type == 'select-one') {
          editedChildren[index[0]][childKey] = {'pk': parseInt(value)};
        } else {
          editedChildren[index[0]][childKey] = value;
        }
      } else {
        newChild[childKey] = value;
        editedChildren.push(newChild);
      }
      this.setState({ editedChildren: editedChildren });
      
    } else {
      // Not child data
      if(e.target.type == 'checkbox') {
        e.target.checked ? this.state.editedClient[id]=true : this.state.editedClient[id]=false;
      } else if (e.target.type=='select-multiple') {
        var selected = this.getMultipleSelectedOptions(e.target);
        this.state.editedClient[id] = selected;
      } else if (e.target.type=='select-one') {
        this.state.editedClient[id] = {'pk': parseInt(value)};  
      } else {
      this.state.editedClient[id] = value;
      }
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

  postEditedClient() {
    var client = this.state.editedClient;
    
    // Add any children edits
    if (this.state.editedChildren.length > 0) {
      client['children'] = this.state.editedChildren;
    }
    // console.log(client);
    const axios = Axios;
    
    //Send info without the file first to get the casenote id
    axios({
      method: 'patch',
      url: Constants.API_URL + '/clients/'+this.props.client.pk+'/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : client
    })
    .then(function(response) {
      if (response.status==200) {        
        //Close Form and refresh data
        this.props.onAdd();
      } 
    }.bind(this))
    .catch(function(error) {
      alert('Unable to edit Client. Server Error');
      console.log(error.response.status);
      console.log(error.response.data);
    })
    
  }


  render() {
    const disabilities = [];
    for (var d in this.props.client.disabilities) {
      disabilities.push(this.props.client.disabilities[d]['pk']);
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Edit Client Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form encType="multipart/form-data" id='editclientform'>
            <FormGroup controlId="dob">
              <ControlLabel>Date of Birth</ControlLabel><HelpBlock>Example: 11/09/2016</HelpBlock>
              <FormControl type="date" defaultValue={this.props.client.dob} onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup controlId="nationality">
              <ControlLabel>Nationality</ControlLabel>
              <FormControl componentClass="select" defaultValue={this.props.client.nationality.pk} onChange={this.handleChange}>
                {this.state.nationalities}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="atoll">
              <ControlLabel>Atoll</ControlLabel>
              <FormControl componentClass="select" defaultValue={this.props.client.atoll.pk} onChange={this.handleChange}>
                {this.state.atolls}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="religion">
              <ControlLabel>Religion</ControlLabel>
              <FormControl componentClass="select" defaultValue={this.props.client.religion.pk} onChange={this.handleChange}>
                {this.state.religions}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="disabilities">
            <ControlLabel>Select Disabilities</ControlLabel>
              <FormControl defaultValue={disabilities} componentClass="select" onChange={this.handleChange} multiple>
                {this.state.disabilities}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="children">
              <ControlLabel>Clients Children</ControlLabel>
              {
                this.props.client['children'].map((ch,index) => (
                  <Well key={index}>
                    <div id={'child'+ch.pk}>
                      <FormGroup>
                        <input id={'child-'+ch.pk+'-id'} type="number" hidden value={ch.pk} readOnly/>
                        <FormControl id={'child-'+ch.pk+'-first_name'} type="text" defaultValue={ch.first_name} onChange={this.handleChange}/>
                        <FormControl id={'child-'+ch.pk+'-last_name'} type="text" defaultValue={ch.last_name} onChange={this.handleChange}/>
                        <ControlLabel>Date of Birth</ControlLabel>
                        <FormControl id={'child-'+ch.pk+'-dob'} type="date" defaultValue={ch.dob} onChange={this.handleChange}/>
                        <FormControl id={'child-'+ch.pk+'-location'} type="text" placeholder="Location" defaultValue={ch.location} onChange={this.handleChange}/>
                        <ControlLabel>Relationship to Client</ControlLabel>
                        <FormControl id={'child-'+ch.pk+'-relationship_to_client'} defaultValue={ch.relationship_to_client ? ch.relationship_to_client.pk : 0} componentClass="select" onChange={this.handleChange}>
                          <option></option>
                          {this.state.relationships}
                        </FormControl>
                      </FormGroup>
                    </div>
                  </Well>
                ))
              }
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.postEditedClient}>Save</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}