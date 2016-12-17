import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';
import Axios from 'axios';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');


export default class NewCasefileModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      nationalities: [],
      relationships: [],
      violences: [],
      injuries: [],
      referrers: [],
      showInjuries: false,
      supportperiod: {
        'client_id': this.props.client.pk,
        'date_of_referral': '',
        'referrer': {
          'pk':1
        },
        'risk_at_referral': 'LOW',
        'violence_at_referral': [],
        'injuries_at_referral': [],
        'reason_for_referral': '',
        'protection_order_at_referral': false,
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
      },
    }

    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addSupportPeriod = this.addSupportPeriod.bind(this);
    this.getMultipleSelectedOptions = this.getMultipleSelectedOptions.bind(this);
    this.postSupportPeriod = this.postSupportPeriod.bind(this);
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

    function getRelationships() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/relationships/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getViolences() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/violences/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getReferrers() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/referrers/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getInjuries() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/injuries/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }
  
    axios.all([getNationalities(), getRelationships(), getViolences(), getReferrers(), getInjuries()])
    .then(axios.spread(function (n, re, v, ref, i) {
      var nationalities = n.data.results.map(n => <option key={n.pk} value={n.pk}>{n.type}</option>);
      var relationships = re.data.results.map(re => <option key={re.pk} value={re.pk}>{re.type}</option>);
      var violences = v.data.results.map(v => <option key={v.pk} value={v.pk}>{v.type}</option>);
      var referrers = ref.data.results.map(ref => <option key={ref.pk} value={ref.pk}>{ref.name}</option>);
      var injuries = i.data.results.map(i => <option key={i.pk} value={i.pk}>{i.type}</option>);

      this.setState({ nationalities: nationalities, relationships: relationships, violences:violences, referrers:referrers, injuries:injuries});
    }.bind(this)))

  }

  handleChange(e) {
    const supportperiod = Object.assign({}, this.state.supportperiod);
    const id = e.target.id;
    const value = e.target.value;
    if (id.includes("user_of_violence")) {
      if (e.target.type=='select-one') {
        supportperiod['user_of_violence'][0][id.substr(17)]['pk'] = value;  
      } else {
        supportperiod['user_of_violence'][0][id.substr(17)] = value;
      }

    } else {

      if(e.target.type == 'checkbox') {
        console.log(e.target.checked)
        supportperiod[id] = e.target.checked;
      } 
      
      if (e.target.type=='select-one') {
        if (id == 'risk_at_referral') {
          supportperiod[id] = value;
        } else {
          supportperiod[id]['pk'] = value;  
        }
      } else if (e.target.type=='select-multiple') {
        var selected = this.getMultipleSelectedOptions(e.target);
        supportperiod[id] = selected;
      } else {
        if (e.target.type!='file') {
          supportperiod[id] = value;
        }
      }
      
    }
    this.setState({ supportperiod });
  }
    
  getMultipleSelectedOptions(select) {
    var selected = [];
    var options = select && select.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        selected.push({'pk': opt.value});
      }
    }

    return selected;
  }

  addSupportPeriod() { 
    // Check for protection order
    if (this.state.supportperiod.protection_order_at_referral == true && document.getElementById('protection_expiration_date_at_referral').value != '') {
      this.state.supportperiod.protection_expiration_date_at_referral = document.getElementById('protection_expiration_date_at_referral').value; 
    }
    console.log(this.state.supportperiod);
    var errorFields = [];
    // Check for empty values
    for (var key in this.state.supportperiod) {
      if (this.state.supportperiod.hasOwnProperty(key)) {
        
        if (key == 'referral_form' || key == 'injuries_at_referral' || key == 'reason_for_referral' || key == 'protection_expiration_date_at_referral' || key == 'protection_order_at_referral') {
          continue;
        } else if (key == 'user_of_violence') {
          for (var abuserKey in this.state.supportperiod['user_of_violence'][0]) {
            if (this.state.supportperiod['user_of_violence'][0][abuserKey] == '') {
              errorFields.push('User of Violence '+abuserKey+' ');
            }
          }
        } else if (this.state.supportperiod[key] == '') {
          errorFields.push(key+' ');
        }

      }
    }

    // Check for any injuries
    if (this.state.showInjuries == true) {
      var injuries = document.getElementById('injuries_at_referral');
      var selected = this.getMultipleSelectedOptions(injuries);
      if (selected.length > 0) {
        var supportperiod = this.state.supportperiod;
        supportperiod.injuries_at_referral = selected;
        this.setState({ supportperiod: supportperiod });
      } else {
        errorFields.push('Must select at least 1 injury');
      }
    }

    if (errorFields.length > 0) {
      alert('Fields: \n' + errorFields + '\ncannot be blank.');
    } else {  
      this.postSupportPeriod();
    }
  }

  postSupportPeriod() {
    const axios = Axios;
    document.body.style.cursor='wait';
    axios({
      method: 'post',
      url: Constants.API_URL + '/supportperiods/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : this.state.supportperiod
    })
    .then(function(response) {
      if (response.status==201) {
        var referral_form = document.getElementById('referral_form')
        if (referral_form.value == "") {
          this.props.onAdd();
          document.body.style.cursor='default';
        } else {
          this.postReferralForm(response.data.pk);
          document.body.style.cursor='default';
        }
      }
    }.bind(this))
    .catch(function(error) {
      alert('Unable to add Support Period. Server Error.');
      console.log(error);
      console.log(error.response.data);
    })
      
  }

  postReferralForm = ((supportperiodId) => {
    const axios = Axios;    

    var formData = new FormData();
    formData.append('referral_form', document.getElementById('referral_form').files[0]);

    var url = 'http://localhost:8000/supportperiods/'+supportperiodId+'/set_referral_form/';
    
    axios({
      method: 'patch',
      url: url,
      headers: {'Authorization': Cookie.getCookie('token'), 'Content-Type': 'multipart/form-data'},
      data : formData
    })
    .then(function(response) {
      // Refresh the form values
      this.resetSupportPeriod();
      this.props.onAdd();
      document.body.style.cursor='default';    
    }.bind(this))
    .catch(function(error) {
      alert('Support Period added but referral form unable to upload.');
      console.log(error.response.data);
    })
  })

  resetSupportPeriod = (() => {
    var supportperiod = {
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
        }
      

      this.setState({ supportperiod: supportperiod });
      this.setState({ showInjuries: false, })
  })

  toggleInjured = (() => {
    if (this.state.supportperiod.injuries_at_referral.length > 0) {
      delete this.state.supportperiod.injuries_at_referral;
    }
    this.setState({ showInjuries: !this.state.showInjuries })
  })

  toggleProtectionOrder = (() => {
    if (this.state.supportperiod['protection_expiration_date_at_referral']) {
      delete this.state.supportperiod['protection_expiration_date_at_referral'];
    }
    var supportperiod = this.state.supportperiod;
    supportperiod.protection_order_at_referral = !this.state.supportperiod['protection_order_at_referral'];
    this.setState({ supportperiod: supportperiod })
  })


  render() {
    const risks = [{title: 'High', value: 'HIGH'}, {title: 'Medium', value: 'MEDIUM'}, {title: 'Low', value: 'LOW'}];
    let Risks = risks.map( (r,index) => (
      <option key={index} value={r.value}>{r.title}</option>
    )); 

    const InjuriesForm = (() => (
        this.state.showInjuries ?
          <FormGroup controlId="injuries_at_referral">
            <ControlLabel>Select Client Injuries</ControlLabel>
            <FormControl componentClass="select" multiple>
              {this.state.injuries}
            </FormControl>
          </FormGroup>
        :
          ''
    ));

    const ExpirationDateForm = (() => (
        this.state.supportperiod['protection_order_at_referral'] ?
          <FormGroup controlId="protection_expiration_date_at_referral">
            <ControlLabel>Protection Order Expiration Date</ControlLabel>
            <FormControl type="date"/>
          </FormGroup>
        :
          ''
    ));

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Add New Support Period</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
             <Tabs defaultActiveKey={1} id='uncontrolled-tab'>
              <Tab eventKey={1} title='Referral Details'>
                <FormGroup controlId="date_of_referral">
                    <ControlLabel>Date of Referral</ControlLabel>
                    <FormControl type="date" onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup controlId="referrer">
                    <ControlLabel>Select Referrer</ControlLabel>
                    <FormControl componentClass="select" onChange={this.handleChange}>
                      {this.state.referrers}
                    </FormControl>
                  </FormGroup>
                  <FormGroup controlId="risk_at_referral">
                    <ControlLabel>Select Risk at Referral</ControlLabel>
                    <FormControl componentClass="select" onChange={this.handleChange}>
                      {Risks}
                    </FormControl>
                  </FormGroup>
                  <FormGroup controlId="violence_at_referral">
                    <ControlLabel>Select Violence Types</ControlLabel>
                    <FormControl componentClass="select" onChange={this.handleChange} multiple>
                      {this.state.violences}
                    </FormControl>
                  </FormGroup>
                  <FormGroup controlId="reason_for_referral">
                    <ControlLabel>Reason for Referral</ControlLabel>
                    <FormControl componentClass="textarea" placeholder="Enter Reason for Referral" onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Referral Form</ControlLabel>
                    <FormControl id="referral_form" type="file" onChange={this.handleChange} accept=".pdf"/>            
                  </FormGroup>
                  <FormGroup controlId="injuries">
                    <Checkbox id="injuries" value="true" checked={this.state.showInjuries} onChange={this.toggleInjured}>Has Injuries</Checkbox>
                  </FormGroup>
                  {InjuriesForm()}
                  <FormGroup controlId="protection_order_at_referral">
                    <Checkbox id="protection_order" value="true" checked={this.state.supportperiod['protection_order']} onChange={this.toggleProtectionOrder}>Has Protection Order</Checkbox>
                  </FormGroup>
                  {ExpirationDateForm()}
              </Tab>
              <Tab eventKey={2} title='User of Violence'>
                <FormGroup controlId="user_of_violence_first_name">
                  <ControlLabel>User of Violences First Name</ControlLabel>
                  <FormControl type="text" placeholder="Enter First Name" onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup controlId="user_of_violence_last_name">
                  <ControlLabel>User of Violences Last Name</ControlLabel>
                  <FormControl type="text" placeholder="Enter Last Name" onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup controlId="user_of_violence_gender">
                  <ControlLabel>Select User of Violences Nationality</ControlLabel>
                  <FormControl value={this.state.supportperiod['user_of_violence'][0]['gender']} componentClass="select" onChange={this.handleChange}>
                    <option>Male</option>
                    <option>Female</option>
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="user_of_violence_nationality">
                  <ControlLabel>Select User of Violences Gender</ControlLabel>
                  <FormControl value={this.state.supportperiod['user_of_violence'][0]['nationality']['pk']} componentClass="select" onChange={this.handleChange}>
                    {this.state.nationalities}
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="user_of_violence_relationship_to_client">
                  <ControlLabel>Select Relationship to Client</ControlLabel>
                  <FormControl value={this.state.supportperiod['user_of_violence'][0]['relationship_to_client']['pk']} componentClass="select" onChange={this.handleChange}>
                    {this.state.relationships}
                  </FormControl>
                </FormGroup>
              </Tab>
            </Tabs>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.addSupportPeriod}>Add</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}