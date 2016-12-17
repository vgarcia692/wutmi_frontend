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
      violences: [],
      atolls: [],
      relationships: [],
      closurereasons: [],
      
      supportperiod: {},
      editedSupporPeriod: {}
    }
    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.postEditedSupportPeriod = this.postEditedSupportPeriod.bind(this);
    this.postClosureForm = this.postClosureForm.bind(this);
  }

  componentDidMount() {
    this.getDataOptions();
    this.setState({ supportperiod: this.props.supportperiod });
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

    function getClosureReasons() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/closurereasons/',
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

  
    axios.all([getNationalities(), getAtolls(), getRelationships(), getViolences(), getClosureReasons(), getReferrers(), getInjuries()])
    .then(axios.spread(function (n, a, r, v, c, ref, i) {
      var nationalities = n.data.results.map(n => <option key={n.pk} value={n.pk}>{n.type}</option>);
      var atolls = a.data.results.map(a => <option key={a.pk} value={a.pk}>{a.name}</option>);
      var relationships = r.data.results.map(r => <option key={r.pk} value={r.pk}>{r.type}</option>);
      var violences = v.data.results.map(v => <option key={v.pk} value={v.pk}>{v.type}</option>);
      var closurereasons = c.data.results.map(c => <option key={c.pk} value={c.pk}>{c.reason}</option>);
      var referrers = ref.data.results.map(ref => <option key={ref.pk} value={ref.pk}>{ref.name}</option>);
      var injuries = i.data.results.map(i => <option key={i.pk} value={i.pk}>{i.type}</option>);

      this.setState({ nationalities: nationalities, atolls: atolls, relationships: relationships, violences: violences, closurereasons: closurereasons, referrers:referrers, injuries:injuries});
    }.bind(this)))

  }
  

  handleChange(e) {
    const id = e.target.id;
    const value = e.target.value;
    if(e.target.type == 'checkbox') {
      e.target.checked ? this.state.editedSupporPeriod[id]=true : this.state.editedSupporPeriod[id]=false;
    } else if (e.target.type=='select-multiple') {
      var selected = this.getMultipleSelectedOptions(e.target);
      this.state.editedSupporPeriod[id] = selected;
    } else if (e.target.type=='select-one') {
      if (id == 'risk_at_referral' || id == 'risk_at_closure') {
        this.state.editedSupporPeriod[id] = value;
      } else {
        this.state.editedSupporPeriod[id] = {'pk': value};  
      }
    } else {
      if(e.target.type != 'file') {
        this.state.editedSupporPeriod[id] = value;
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


  postEditedSupportPeriod() {
    const axios = Axios;
    var supportperiod = this.state.editedSupporPeriod;
    
    axios({
      method: 'patch',
      url: Constants.API_URL + '/supportperiods/'+this.props.supportperiod.pk+'/',
      headers: {'Authorization': Cookie.getCookie('token')},
      data : supportperiod
    })
    .then(function(response) {
      if (response.status==200) { 
          if (document.body.contains(document.getElementById('closure_form')) && document.getElementById('closure_form').value != '') {
            this.postClosureForm()
          } else {
            //Close Form and refresh data
            this.props.onAdd();
          }       
      } 
    }.bind(this))
    .catch(function(error) {
      alert('Unable to edit Support Period. Server Error');
      console.log(error.response.data);
    })
    
  }


  postClosureForm = (() => {
    const axios = Axios;    

    var formData = new FormData();
    formData.append('closure_form', document.getElementById('closure_form').files[0]);

    var url = 'http://localhost:8000/supportperiods/'+this.props.supportperiod.pk+'/set_closure_form/';
    
    axios({
      method: 'patch',
      url: url,
      headers: {'Authorization': Cookie.getCookie('token'), 'Content-Type': 'multipart/form-data'},
      data : formData
    })
    .then(function(response) {
      // Refresh the form values
      this.props.onAdd();    
    }.bind(this))
    .catch(function(error) {
      alert('Referral updated but referral form unable to upload.');
      console.log(error.response.data);
    })
  })


  render() {
    const risks = [{title: 'Low', value: 'LOW'}, {title: 'Medium', value: 'MEDIUM'}, {title: 'High', value: 'HIGH'}];
    let Risks = risks.map( (r,index) => (
      <option key={index} value={r.value}>{r.value}</option>
    ));

    const violences = [];
    for (var v in this.props.supportperiod.violence) {
      violences.push(this.props.supportperiod.violence[v]['pk']);
    }

    const injuries = [];
    for (var i in this.props.supportperiod.injuries) {
      injuries.push(this.props.supportperiod.injuries[i]['pk']);
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Edit Referral Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup controlId="date_of_referral">
              <ControlLabel>Date of Referral</ControlLabel>
              <FormControl type="date" onChange={this.handleChange} defaultValue={this.props.supportperiod.date_of_referral}/>
            </FormGroup>
            <FormGroup controlId="referrer">
              <ControlLabel>Referrer</ControlLabel>
              <FormControl defaultValue={this.props.supportperiod.referrer.pk} componentClass="select" onChange={this.handleChange}>
                {this.state.referrers}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="risk_at_referral">
              <ControlLabel>Select Risk at Referral</ControlLabel>
              <FormControl defaultValue={this.props.supportperiod.risk_at_referral} componentClass="select" onChange={this.handleChange}>
                {Risks}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="violence_at_referral">
              <ControlLabel>Select Violence Types</ControlLabel>
              <FormControl defaultValue={violences} componentClass="select" onChange={this.handleChange} multiple>
                {this.state.violences}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="reason_for_referral">
              <ControlLabel>Reason for Referral</ControlLabel>
              <FormControl componentClass="textarea" defaultValue={this.props.supportperiod.reason_for_referral} type="text"  onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup controlId="injuries_at_referral">
            <ControlLabel>Select Injuries</ControlLabel>
              <FormControl defaultValue={injuries} componentClass="select" onChange={this.handleChange} multiple>
                {this.state.injuries}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="protection_expiration_date_at_referral">
              <ControlLabel>Date of Referral</ControlLabel>
              <FormControl type="date" onChange={this.handleChange} defaultValue={this.props.supportperiod.expiration_date}/>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.postEditedSupportPeriod}>Save</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}