import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, Form, FormControl, ControlLabel, Checkbox, Well } from 'react-bootstrap';
import Axios from 'axios';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');


export default class NewClientForm extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      nationalities: [],
      atolls: [],
      religions: [],
      relationships: [],
      disabilities: [],
      showDisabilities: false,
      childrenInput: [],
      children: [],
      childrenCount: 0,


      client: {
        'last_name': '',
        'first_name': '',
        'dob': '',
        'nationality': {
          'pk': 1
        },
        'atoll': {
          'pk': 1
        },
        'religion': {
          'pk': 1
        }
      }
      
    }

    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addClient = this.addClient.bind(this);
    this.getMultipleSelectedOptions = this.getMultipleSelectedOptions.bind(this);
    this.postClient = this.postClient.bind(this);
    this.toggleDisabled = this.toggleDisabled.bind(this);
    this.handleChildCount = this.handleChildCount.bind(this);
    this.resetClient = this.resetClient.bind(this);
  }


  componentDidMount() {
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

    function getRelationships() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/relationships/',
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
  
    axios.all([getNationalities(), getAtolls(), getReligions(), getRelationships(), getDisabilities()])
    .then(axios.spread(function (n, a, r, re, d) {
      var nationalities = n.data.results.map(n => <option key={n.pk} value={n.pk}>{n.type}</option>);
      var atolls = a.data.results.map(a => <option key={a.pk} value={a.pk}>{a.name}</option>);
      var religions = r.data.results.map(r => <option key={r.pk} value={r.pk}>{r.type}</option>);
      var relationships = re.data.results.map(re => <option key={re.pk} value={re.pk}>{re.type}</option>);
      var disabilities = d.data.results.map(d => <option key={d.pk} value={d.pk}>{d.type}</option>);

      this.setState({ nationalities: nationalities, atolls: atolls, religions: religions, relationships: relationships, disabilities:disabilities});
    }.bind(this)))

  }

  handleChange(e) {
    const client = Object.assign({}, this.state.client);
    const id = e.target.id;
    const value = e.target.value;

      if(e.target.type == 'checkbox') {
        e.target.checked ? client[id]=true : client[id]=false;
      } 
      
      if (e.target.type=='select-one') {
        client[id]['pk'] = value;  
      } else if (e.target.type != 'select-multiple') {
        client[id] = value;
      }
      
    this.setState({ client });

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

  addClient() {
    // Check for any disability
    if (this.state.showDisabilities == true) {
      var disabilities = document.getElementById('disabilities');
      var selected = this.getMultipleSelectedOptions(disabilities);
      var client = this.state.client;
      client.disabilities = selected;
      this.setState({ client: client });
    }

    // Check for any children
    if (this.state.childrenCount >= 0) {
      var children = [];
      for (var x = 1; x <= this.state.childrenCount; x++) {
        var child = {'first_name':'','last_name':'','dob':'','relationship_to_client':{'pk':0}, 'location':''};
        
        var childFirstName = document.getElementById('child'+x+'first_name');
        var childLastName = document.getElementById('child'+x+'last_name');
        var childdob = document.getElementById('child'+x+'dob');
        var childRelationship = document.getElementById('child'+x+'relationship');
        var childLocation = document.getElementById('child'+x+'location');

        child.first_name = childFirstName.value;
        child.last_name = childLastName.value;
        child.dob = childdob.value;
        child.relationship_to_client.pk = parseInt(childRelationship.value);
        child.location = childLocation.value;

        children.push(child);
      }
      var client = this.state.client;
      client.children = children;
      this.setState({ client: client });
    }

    var errorFields = [];
    // Check for empty values
    for (var key in this.state.client) {
      if (this.state.client.hasOwnProperty(key)) {
        
        if (key == 'children') {  
          for (var childIndex in this.state.client['children']) {
            for (var childKey in this.state.client['children'][childIndex]) {
              if(this.state.client['children'][childIndex][childKey]=='') {
                errorFields.push('child '+childKey+' ');
              }
            }
          }
        } else if (this.state.client[key] == '') {
          errorFields.push(key+' ');
        }

      }
    }

    if (errorFields.length > 0) {
      alert('Fields: \n' + errorFields + '\ncannot be blank.');
    } else {
      this.postClient();
    }

  }

  postClient() {
    const axios = Axios;
    document.body.style.cursor='wait';
    axios({
      method: 'post',
      url: Constants.API_URL + '/clients/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : this.state.client
    })
    .then(function(response) {
      if (response.status==201) {
          this.resetClient();
          this.props.onAdd();
          document.body.style.cursor='default';
      }
    }.bind(this))
    .catch(function(error) {
      alert('Unable to add Client. Server Error.');
      console.log(error);
      console.log(error.response.data);
    })
    
  }

  

  toggleDisabled = (() => {
    if (this.state.client.disabilities) {
      delete this.state.client.disabilities;
    }
    this.setState({ showDisabilities: !this.state.showDisabilities })
  })

  handleChildCount = ((e) => {
    var count = parseInt(e.target.value);
    var kids = [];
    for (var x = 1; x <= parseInt(e.target.value); x++) {
      kids.push(
        <Well key={x}>
        <div id={'child'+x}>
          <p>Child {x}</p>
          <FormGroup>
            <FormControl id={'child'+x+'first_name'} type="text" placeholder="First Name"/>
            <FormControl id={'child'+x+'last_name'} type="text" placeholder="Last Name"/>
            <ControlLabel>Date of Birth</ControlLabel>
            {
              Constants.IsFirefox ?
                <FormGroup id={'child'+x+'dob'}>
                  <ControlLabel>Child Date of Birth</ControlLabel>
                  <FormControl type="date" onChange={this.handleChange} placeholder="YYYY-MM-DD (ex. 2016-05-23)"/>
                </FormGroup>
              :
                <FormGroup id={'child'+x+'dob'}>
                  <ControlLabel>Child Date of Birth</ControlLabel>
                  <FormControl type="date" onChange={this.handleChange}/>
                </FormGroup>
            }
            <FormControl id={'child'+x+'location'} type="text" placeholder="Child Location"/>
            <ControlLabel>Relationship to Client</ControlLabel>
            <FormControl id={'child'+x+'relationship'} defaultValue={26} componentClass="select">
              {this.state.relationships}
            </FormControl>
          </FormGroup>
        </div>
        </Well>
      )
    };
    this.setState({ childrenInput: kids });
    this.setState({ childrenCount: count });
  })

  resetClient = (() => {
    var client = {
        'last_name': '',
        'first_name': '',
        'dob': '',
        'nationality': {
          'pk': 1
        },
        'atoll': {
          'pk': 1
        },
        'religion': {
          'pk': 1
        },
        'supportperiod_set': [{
          'date_of_referral': '',
          'referrer': {
            'pk':1
          },
          'risk_at_referral': 'LOW',
          'violence': [],
          'reason_for_referral': '',
          'protection_order': false,
          'user_of_violence': [
            {
              'first_name': '',
              'last_name': '',
              'gender': 'Male',
              'nationality': {
                'pk': 1
              },
              'relationship_to_client': {
                'pk': 1
              }
            }
          ],
        }]
      }

      this.setState({ client: client });
      this.setState({ childrenCount: 0, childrenInput: [], children: [], showDisabilities: false, showInjuries: false, })
  })

  render() {
    const risks = [{title: 'High', value: 'HIGH'}, {title: 'Medium', value: 'MEDIUM'}, {title: 'Low', value: 'LOW'}];
    let Risks = risks.map( (r,index) => (
      <option key={index} value={r.value}>{r.title}</option>
    )); 

    const DisabilityForm = (() => (
        this.state.showDisabilities ?
          <FormGroup controlId="disabilities">
            <ControlLabel>Select Client Disability</ControlLabel>
            <FormControl defaultValue={[]} componentClass="select" multiple>
              {this.state.disabilities}
            </FormControl>
          </FormGroup>
        :
          ''
    ));

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey={1} id='uncontrolled-tab'>
            <Tab eventKey={1} title='Demographic'>
              <form>
                <FormGroup controlId="first_name">
                  <ControlLabel>Client First Name</ControlLabel>
                  <FormControl type="text" placeholder="Enter First Name" onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup controlId="last_name">
                  <ControlLabel>Client Last Name</ControlLabel>
                  <FormControl type="text" placeholder="Enter Last Name" onChange={this.handleChange}/>
                </FormGroup>
                {
                  Constants.IsFirefox ?
                    <FormGroup controlId="dob">
                      <ControlLabel>Client Date of Birth</ControlLabel>
                      <FormControl type="date" onChange={this.handleChange} placeholder="YYYY-MM-DD (ex. 2016-05-23)"/>
                    </FormGroup>
                  :
                    <FormGroup controlId="dob">
                      <ControlLabel>Client Date of Birth</ControlLabel>
                      <FormControl type="date" onChange={this.handleChange}/>
                    </FormGroup>
                }
                <FormGroup controlId="nationality">
                  <ControlLabel>Select Client Nationality</ControlLabel>
                  <FormControl value={this.state.client['nationality']['pk']} componentClass="select" onChange={this.handleChange}>
                    {this.state.nationalities}
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="atoll">
                  <ControlLabel>Select Client Atoll</ControlLabel>
                  <FormControl value={this.state.client['atoll']['pk']} componentClass="select" onChange={this.handleChange}>
                    {this.state.atolls}
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="religion">
                  <ControlLabel>Select Client Religion</ControlLabel>
                  <FormControl value={this.state.client['religion']['pk']} componentClass="select" onChange={this.handleChange}>
                    {this.state.religions}
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="disabled">
                  <Checkbox id="disabled" value="true" checked={this.state.showDisabilities} onChange={this.toggleDisabled}>Is Disabled</Checkbox>
                </FormGroup>
                {DisabilityForm()}
              </form>
            </Tab>

            <Tab eventKey={2} title='Children'>
              <FormGroup controlId="children">
                <ControlLabel>Clients Number of Children</ControlLabel>
                <FormControl min="0" type="number" value={this.state.childrenCount} placeholder="Enter Client's Number of Children" onChange={this.handleChildCount}/>
              </FormGroup>
              {this.state.childrenInput}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.addClient}>Add</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
          <Button bsStyle='danger' onClick={this.resetClient}>Reset</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}