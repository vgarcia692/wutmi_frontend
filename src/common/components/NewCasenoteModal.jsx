import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';
import Axios from 'axios';
import qs from 'qs';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');


export default class NewCasenoteModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      services: [],
      injuries: [],
      violences: [],
      currentInjuries: [],
      currentViolences: [],
      casenote: {
        'support_mode': {
          'pk':1
        },
        'description': '',
        'service_type_offered': []
      },
      support_period_id: 0,
      closure: {}
    }

    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addCasenote = this.addCasenote.bind(this);
    this.getMultipleSelectedOptions = this.getMultipleSelectedOptions.bind(this);
    this.postCasenote = this.postCasenote.bind(this);
    this.postClosureUpdate = this.postClosureUpdate.bind(this);
  }

  componentDidMount() {
    this.getDataOptions();
  }

  getDataOptions() {
    const axios = Axios;

    function getServices() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/services/',
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

    function getViolences() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/violences/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

    function getSupportModes() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/support_modes/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }
  
    axios.all([getServices(), getInjuries(), getViolences(), getSupportModes()])
    .then(axios.spread(function (s, i, v, sm) {
      var services = s.data.results.map(s => <option key={s.pk} value={s.pk}>{s.type}</option>);
      var injuries = i.data.results;
      var violences = v.data.results;
      var support_modes = sm.data.results.map(sm => <option key={sm.pk} value={sm.pk}>{sm.type}</option>);

      this.setState({ services: services, injuries: injuries, violences:violences, support_modes:support_modes});
    }.bind(this)))

  }

  handleChange(e) {
    
    const casenote = Object.assign({}, this.state.casenote);
    const closure = Object.assign({}, this.state.closure);
    const id = e.target.id;
    const value = e.target.value;
    if (id.includes('closure')) {
      if(e.target.type == 'checkbox') {
        e.target.checked ? closure[id.substr(8)]=true : closure[id.substr(8)]=false;
      } else if (e.target.type=='select-multiple') {
        var selected = this.getMultipleSelectedOptions(e.target);
        closure[id.substr(8)] = selected;
      } else {
        closure[id.substr(8)] = value;
      }
      this.setState({ closure });
    } else {
      if (e.target.type=='select-multiple') {
        var selected = this.getMultipleSelectedOptions(e.target);
        casenote[id] = selected;
      } else if (e.target.type=='select') {
        casenote[id] = {'pk':value};
      } else {
        casenote[id] = value;
      }

      this.setState({ casenote });
    }
    
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

  addCasenote() {
    var errorFields = [];
    // Check for empty values
    for (var key in this.state.casenote) {
      if (this.state.casenote.hasOwnProperty(key)) {
        
        if (key == 'follow_up_date' || key == 'follow_up_description' || key == 'casenotedocument_set') {
          continue;
        } else if (this.state.casenote[key] == '') {
          errorFields.push(key+' ');
        }

      }
    }

    if (errorFields.length > 0) {
      alert('Fields: \n' + errorFields + '\ncannot be blank.');
    } else {
      this.postCasenote();
    }
  }

  postCasenote() {
    document.body.style.cursor='wait';
    const axios = Axios;
    var casenote = this.state.casenote; 
    casenote['support_period_id'] = this.props.support_period.pk
    this.setState({ casenote })
    
    // Check for Closure update
    var closureUpdate = false;
    for (var prop in this.state.closure) {
      if (this.state.closure.hasOwnProperty(prop)) {
        closureUpdate = true;
      }
    }
    
    //Send info without the file first to get the casenote id
    axios({
      method: 'post',
      url: Constants.API_URL + '/casenotes/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : this.state.casenote
    })
    .then(function(response) {
      if (response.status==201) {
        // Get casenote id from reponse
        this.setState({ casenoteId: response.data.pk });
        // Check if the there are files if so then post to database
        var listnum = document.getElementById('casenotedocument_set').files.length;
        if (listnum > 0) {
          this.postDocuments();
        } else if (closureUpdate == true) {
          this.postClosureUpdate();
          // Close Form and refresh data
          this.props.onAdd();
          document.body.style.cursor='default';
        } else {
          // Close Form and refresh data
          this.props.onAdd();
          document.body.style.cursor='default';
        }

        // Refresh the form values
        const casenote = Object.assign({}, this.state.casenote);
        casenote['support_period_id'] = parseInt(this.props.support_period_id);
        casenote['description'] = '';
        casenote['service_type_offered'] = '';
        
        this.setState({ casenote });
      }
    }.bind(this))
    .catch(function(error) {
      alert('Unable to add Case Note. Server Error.');
      console.log(error.response.data);
    })
    // console.log(casenote);
    
  }

  postDocuments() {
    const axios = Axios;    

    var formData = new FormData();
    formData.append('casenote',  this.state.casenoteId);

    var listnum = document.getElementById('casenotedocument_set').files.length;
    for (var x = 0; x < listnum; x++) {
      formData.append('file[]', document.getElementById('casenotedocument_set').files[x]);
    }


    axios({
      method: 'post',
      url: Constants.API_URL + '/casenotedocuments/',
      headers: {'Authorization': Cookie.getCookie('token'), 'Content-Type': 'multipart/form-data'},
      data : formData
    })
    .then(function(response) {
      // Refresh the form values
      const casenote = Object.assign({}, this.state.casenote);
      casenote['casefile_id'] = parseInt(this.props.casefileId);
      casenote['description'] = '';
      casenote['service_type_offered'] = '';
      
      this.setState({ casenote });

      this.props.onAdd();  
      document.body.style.cursor='default';  
    }.bind(this))
    .catch(function(error) {
      alert('Unable to add Case Note. Please review your fields.');
      console.log(error.response.status);
      console.log(error.response.data);
    })
  }

  postClosureUpdate = (() => {
    const axios = Axios;
    var closure = this.state.closure; 
    closure['pk'] = this.props.support_period.closure.pk
    this.setState({ closure })
    
    axios({
      method: 'patch',
      url: Constants.API_URL + '/closures/'+this.props.support_period.closure.pk+'/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : this.state.closure
    })
    .then(function(response) {
      if (response.status==201) {
        // Refresh the form values
        closure = {}
        this.setState({ closure });
        this.props.onAdd();
      }
    }.bind(this))
    .catch(function(error) {
      alert('Unable to update Closure. Server Error');
      console.log(error.response.data);
    })
  })

  
  render() {  
    var injuryOptions = [];
    var violenceOptions = [];
    if (this.props.closure != null && this.props.closure.pk > 0) {
      var currentInjuriesIds = this.props.closure.injuries.map((i) => {
        return i.pk
      });
      
      for (var inj in this.state.injuries) {
        if (currentInjuriesIds.includes(this.state.injuries[inj]['pk'])) {
          injuryOptions.push(<option key={this.state.injuries[inj]['pk']} selected disabled value={this.state.injuries[inj]['pk']}>{this.state.injuries[inj]['type']}</option>);
        } else {
          injuryOptions.push(<option key={this.state.injuries[inj]['pk']} value={this.state.injuries[inj]['pk']}>{this.state.injuries[inj]['type']}</option>);
        }
      }

      var currentViolencesIds = this.props.closure.violence.map((v) => {
        return v.pk
      });
      
      for (var violence in this.state.violences) {
        if (currentViolencesIds.includes(this.state.violences[violence]['pk'])) {
          violenceOptions.push(<option key={this.state.violences[violence]['pk']} selected disabled value={this.state.violences[inj]['pk']}
          value={this.state.violences[inj]['pk']}>{this.state.violences[violence]['type']}</option>);
        } else {
          violenceOptions.push(<option key={this.state.violences[violence]['pk']} value={this.state.violences[inj]['pk']}
          value={this.state.violences[inj]['pk']}>{this.state.violences[violence]['type']}</option>);
        }
      }
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Add New CaseNote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup controlId="description">
              <ControlLabel>Case Note</ControlLabel>
              <FormControl componentClass="textarea" placeholder="Enter Case Note" onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup controlId="support_mode">
              <ControlLabel>Select Support Modes</ControlLabel>
              <FormControl componentClass="select" defaultValue={1} onChange={this.handleChange}>
                {this.state.support_modes}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="service_type_offered">
              <ControlLabel>Select Servieces Offered</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleChange} multiple>
                {this.state.services}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="follow_up_date">
              <ControlLabel>Follow Up Date</ControlLabel><HelpBlock>Example: 11/09/2016</HelpBlock>
              <FormControl type="date" onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup controlId="follow_up_description">
              <ControlLabel>Follow Up Description</ControlLabel>
              <FormControl componentClass="textarea" placeholder="Enter Follow Up Description" onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup controlId="casenotedocument_set">
              <ControlLabel>Documents</ControlLabel>
              <FormControl type="file" onChange={this.handleChange} multiple accept=".pdf"/>            
            </FormGroup>
            <FormGroup controlId="closure_injuries">
              <ControlLabel>Add Additonal Injuries</ControlLabel>
              <HelpBlock>Current Injuries are greyed and disabled</HelpBlock>
              <FormControl componentClass="select" onChange={this.handleChange} multiple>
                {
                  injuryOptions
                }
              </FormControl>
            </FormGroup>
            <FormGroup controlId="closure_violence">
              <ControlLabel>Add Additonal Violences</ControlLabel>
              <HelpBlock>Current Violences are greyed and disabled</HelpBlock>
              <FormControl componentClass="select" onChange={this.handleChange} multiple>
                {
                  violenceOptions
                }
              </FormControl>
            </FormGroup>
            <FormGroup controlId="closure_protection_order">
              <Checkbox id="closure_protection_order" onChange={this.handleChange} defaultChecked={this.props.support_period.closure != null ? this.props.support_period.closure.protection_order : false }>Has Protection Order</Checkbox>
            </FormGroup>
            <FormGroup controlId="closure_protection_expiration_date">
              <ControlLabel>Protection Expiration Date</ControlLabel><HelpBlock>Example: 11/09/2016</HelpBlock>
              <FormControl type="date" defaultValue={this.props.support_period.closure != null ? this.props.support_period.closure.protection_expiration_date : ''} onChange={this.handleChange}/>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.addCasenote}>Add</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}