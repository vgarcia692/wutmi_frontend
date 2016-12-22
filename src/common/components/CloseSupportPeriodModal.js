import React from 'react';
import { Button, Modal, Tabs, Tab, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';
import Axios from 'axios';
import dateFormat from 'dateFormat';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');


export default class CloseSupportPeriodModal extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      closurereasons: [],
      closure: {
        closure_date: '',
        closure_reason: {'pk':1},
        risk_at_closure: 'LOW',
        client_agree_case_close: false,
        client_knows_case_close: false,
      }
    }
    this.getDataOptions = this.getDataOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.postClosureUpdate = this.postClosureUpdate.bind(this);
  }

  componentDidMount() {
    this.getDataOptions();
    this.setState({ supportperiod: this.props.supportperiod });
  }

  getDataOptions() {
    const axios = Axios;

    function getClosureReasons() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/closurereasons/',
        headers: {'Authorization': Cookie.getCookie('token')}
      });
    }

  
    axios.all([getClosureReasons()])
    .then(axios.spread(function (c) {
      var closurereasons = c.data.results.map(c => <option key={c.pk} value={c.pk}>{c.reason}</option>);

      this.setState({ closurereasons: closurereasons});
    }.bind(this)))

  }
  

  handleChange(e) {
    var closure = Object.assign({}, this.state.closure);
    const id = e.target.id;
    const value = e.target.value;
    if(e.target.type == 'checkbox') {
      e.target.checked ? closure[id]=true : closure[id]=false;
    } else if (e.target.type=='select-multiple') {
      var selected = this.getMultipleSelectedOptions(e.target);
      closure[id] = selected;
    } else if (e.target.type=='select-one') {
      if (id == 'risk_at_closure') {
        closure[id] = value;
      } else {
        closure[id] = {'pk': value};  
      }
    } else {
      if(e.target.type != 'file') {
        closure[id] = value;
      }
    }

    this.setState({ closure });
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


  postClosureUpdate() {
    document.body.style.cursor='wait';
    if (this.state.closure.closure_date != '') {
      const axios = Axios;
      var closure = this.state.closure;
      axios({
        method: 'patch',
        url: Constants.API_URL + '/closures/'+this.props.closure.pk+'/',
        headers: {'Authorization': Cookie.getCookie('token')},
        data : closure
      })
      .then(function(response) {
        if (response.status==200) { 
          var closure_form = document.getElementById('closure_form')
          if (closure_form.value == "") {
            this.props.onAdd();
            this.body.style.cursor='default';
          } else {
            this.postClosureForm();
            this.props.onAdd();
            document.body.style.cursor='default';
          }
        } 
      }.bind(this))
      .catch(function(error) {
        alert('Unable to close Support Period. Server Error');
        console.log(error.response.data);
      })
    } else {
      alert('Need Closure Date.');
    }
    
  }

  postClosureForm = (() => {
    const axios = Axios;    

    var formData = new FormData();
    formData.append('closure_form', document.getElementById('closure_form').files[0]);

    var url = Constants.API_URL + '/closures/'+this.props.closure.pk+'/set_closure_form/';
    
    axios({
      method: 'patch',
      url: url,
      headers: {'Authorization': Cookie.getCookie('token'), 'Content-Type': 'multipart/form-data'},
      data : formData
    })
    .then(function(response) {
      // Refresh the form values
      this.props.onAdd();
      document.body.style.cursor='default';    
    }.bind(this))
    .catch(function(error) {
      alert('Closure closed but referral form unable to upload.');
      console.log(error.response.data);
    })
  })


  render() {
    const risks = [{title: 'Low', value: 'LOW'}, {title: 'Medium', value: 'MEDIUM'}, {title: 'High', value: 'HIGH'}];
    let Risks = risks.map( (r,index) => (
      <option key={index} value={r.value}>{r.value}</option>
    ));

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Closure Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup>
              <ControlLabel>Closure Form</ControlLabel>
              <FormControl id="closure_form" type="file" onChange={this.handleChange} accept=".pdf"/>
            </FormGroup> 
            {
              Constants.IsFirefox ?
                <FormGroup controlId="closure_date">
                  <ControlLabel>Closure Date</ControlLabel>
                  <FormControl type="date" onChange={this.handleChange} placeholder="YYYY-MM-DD (ex. 2016-11-09)"/>
                </FormGroup>
              :
                <FormGroup controlId="closure_date">
                  <ControlLabel>Closure Date</ControlLabel>
                  <FormControl type="date" onChange={this.handleChange} />
                </FormGroup>
            }           
            <FormGroup controlId="closure_reason">
              <ControlLabel>Closure Reason</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleChange}>
                {this.state.closurereasons}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="risk_at_closure">
              <ControlLabel>Risk at Closure</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleChange}>
                {Risks}
              </FormControl>
            </FormGroup>
            <FormGroup controlId="client_knows_case_close">
              <Checkbox id="client_knows_case_close" onChange={this.handleChange}>Client knows their case is being closed.</Checkbox>
            </FormGroup>
            <FormGroup controlId="client_agree_case_close">
              <Checkbox id="client_agree_case_close" onChange={this.handleChange}>Client agrees to their case being closed.</Checkbox>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={this.postClosureUpdate}>Close Support Period</Button>
          <Button bsStyle='danger' onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}