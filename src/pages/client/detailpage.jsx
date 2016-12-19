import React from 'react';
import { Link } from 'react-router';
import { Table, Button, Row, Col, Tabs, Tab, Panel } from 'react-bootstrap';
import styles from './style.css';
import Axios from 'axios';
import LoadingGifModal from '../../common/components/LoadingGifModal';
import ClientEditModal from '../../common/components/ClientEditModal';
import NewSupportPeriodModal from '../../common/components/NewSupportPeriodModal';
import dateFormat from 'dateFormat';
const Constants = require('../../common/Constants.js')
const Cookie = require('../../common/Cookie.js');

export default class ClientDetailPage extends React.Component {
  constructor(props) {
    super(props)    
    this.state = {
      loadingShow: false,
      editFormShow: false,
      newSupportPeriodShow: false,
      
      client: {
        'pk': props.params.pk,
        'last_name': '',
        'first_name': '',
        'dob': '',
        'nationality': {
          'type': ''
        },
        'atoll': {
          'name': ''
        },
        'religion': {
          'type': ''
        },
        'disabilities': [],
        'children': [],
        'disabled': false,
        'supportperiod_set': [{
          'date_of_referral': '',
          'referrer': '',
          'risk_at_referral': 'LOW',
          'violence': [],
          'other_violence_description': '',
          'injuries': false,
          'user_of_violence': [
            {
              'first_name': '',
              'last_name': '',
              'nationality': {
                'pk': 1
              },
              'relationship_to_abuser': {
                'pk': 1
              }
            }
          ],
          'input_by': {
            'username': ''
          }
        }],
        'created_at': ''
      }
    }

    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.showEditFrom = this.showEditFrom.bind(this);
    this.hideEditForm = this.hideEditForm.bind(this);
    this.showNewSupportPeriodForm = this.showNewSupportPeriodForm.bind(this);
    this.hideNewSupportPeriodForm = this.hideNewSupportPeriodForm.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.handleTabSelect = this.handleTabSelect.bind(this);
  }


  componentDidMount() {
    this.getData();
  }
  
  getData() {
    this.showLoading()
    const id = this.props.params.pk;
    const axios = Axios;
    
    function getClientData() {
      return axios({
        method: 'get',
        url: Constants.API_URL + '/clients/'+id+'/',
        headers: {'Authorization': Cookie.getCookie('token')}
      })
    }

    axios.all([getClientData()])
    .then(axios.spread(function(c) {
      var client = Object.assign({}, this.state.client);
      var client = c.data;
      this.setState({ client: client });
      this.hideLoading();
    }.bind(this)))
    .catch(function(error) {
      console.log(error);
    })
  }

  showLoading() {
    this.setState({
      loadingShow: true
    });
  }

  hideLoading() {
    this.setState({
      loadingShow: false
    });
  }

  showEditFrom() {
    this.setState({
      editFormShow: true
    });
  }

  hideEditForm() {
    this.setState({
      editFormShow: false
    });
  }

  showNewSupportPeriodForm() {
    this.setState({
      newSupportPeriodShow: true
    });
  }

  hideNewSupportPeriodForm() {
    this.setState({
      newSupportPeriodShow: false
    });
  }  

  refreshData() {
    this.setState(() => ({
      editFormShow: false,
      newSupportPeriodShow: false
    }))

    // Refresh data from Database
    this.getData();
    console.log('data refreshed');
  }

  handleTabSelect(eventKey) {
    // event.preventDefault();
    sessionStorage.setItem('clientTabKey',parseInt(eventKey));
  }

  render() {
    var supportperiods = this.state.client.supportperiod_set;
    var SupportPeriods = supportperiods.map((sp,index) => (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{dateFormat(sp.created_at, 'fullDate')}</td>
          <td>{dateFormat(sp.date_of_referral, 'fullDate')}</td>
          <td>{sp.referrer['name']}</td>
          <td>{sp.risk_at_referral}</td>
          <td>
            {
                sp.referral_form ?
                  <a key={index} href={Constants.API_URL+ "/document/"+Cookie.getCookie('token').split(' ')[1]+"/referral/"+sp.pk+'/'}>view</a>
                :
                  ''
            }
          </td>
          <td>{sp.closure_date}</td>
          <td>
            {
              sp.closure_form ?
                <a href={Constants.API_URL+ "/document/"+Cookie.getCookie('token').split(' ')[1]+"/closure/"+this.state.supportperiod.pk+'/'}>view</a>
              :
                ''
            }
          </td>
          <td><Link to={"/home/supportperiod/"+sp.pk}>Open</Link></td>
        </tr>
    ));
    

    return (
      <div className={styles.content}>
        <h1 className={styles.heading}>{this.state.client['first_name']} {this.state.client['last_name']}</h1>
        <Tabs onSelect={this.handleTabSelect} defaultActiveKey={(sessionStorage.getItem('clientTabKey')!=null) ? parseInt(sessionStorage.getItem('clientTabKey')) : 1} id='uncontrolled-tab'>
            <Tab eventKey={1} title='Client'>
              <div className={styles.content}>
                <Button bsStyle="info" className={styles.addButton} onSelect={this.showEditFrom}>Edit</Button>
                <h4>Client</h4>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td><strong>Date of Birth:</strong></td>
                      <td>{dateFormat(this.state.client['dob'], 'fullDate')}</td>
                    </tr>
                    <tr>
                      <td><strong>Nationality:</strong></td>
                      <td>{this.state.client['nationality']['type']}</td>
                    </tr>
                    <tr>
                      <td><strong>Atoll:</strong></td>
                      <td>{this.state.client['atoll']['name']}</td>
                    </tr>
                    <tr>
                      <td><strong>Religion:</strong></td>
                      <td>{this.state.client['religion']['type']}</td>
                    </tr>
                    <tr>
                      <td><strong>Disability:</strong></td>
                      <td>
                          {
                            this.state.client['disabilities'].map((d,index) => (
                              <li key={index}>{d.type}</li>
                            ))
                          }
                      </td>
                    </tr>
                    
                    <tr>
                      <td><strong>Children:</strong></td>
                      <td>
                        <ul>
                          {
                            this.state.client['children'].map((ch,index) => (
                              <li key={index}>{ch.first_name} {ch.last_name}
                                <ul>
                                  <li>DOB: {dateFormat(ch.dob, 'fullDate')}</li>
                                  <li>Relationship: {ch.relationship_to_client ? ch.relationship_to_client.type : ''}</li>
                                  <li>Location: {ch.location}</li>
                                </ul>
                              </li>
                            ))
                          }
                        </ul>
                      </td>
                    </tr>
                  </tbody> 
                </Table>
                <h4>Support Periods</h4>
                {
                  this.state.client['supportperiod_set'].map((sp,index) => (
                    <Panel header={"Support Period: " +dateFormat(sp.created_at,'fullDate')} key={index}>
                      {
                        sp.user_of_violence.map((uov,index) => (
                          <div key={index}>
                            <u>User of Violence</u>
                            <p>{uov.first_name} {uov.last_name}</p>
                          </div>
                        ))
                      }
                      <u>Protection Order</u>
                      <p>{sp.protection_order_at_referral ? 'Yes' : 'None'}</p>
                      <p>{sp.protection_expiration_date_at_referral ? 'Expiring: ' + dateFormat(sp.protection_expiration_date_at_referral,'fullDate') : ''}</p>
                    </Panel>
                  ))
                }
              </div>
            </Tab>
            <Tab eventKey={2} title='Support Periods'>
              <div className={styles.content}>
                <Button bsStyle="success" className={styles.addButton} onClick={this.showNewSupportPeriodForm}>+</Button>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <td>#</td>
                      <td>Date Created</td>
                      <td>Date of Referral</td>
                      <td>Referrer</td>
                      <td>Risk at Referral</td>
                      <td>Referral Form</td>
                      <td>Closure Date</td>
                      <td>Closure Form</td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {SupportPeriods}
                  </tbody> 
                </Table>
              </div>
            </Tab>
        </Tabs>
        <ClientEditModal 
          show={this.state.editFormShow} 
          onHide={this.hideEditForm} 
          client={this.state.client} 
          onAdd={this.refreshData} 
          showLoading={this.showLoading}
          hideLoading={this.hideLoading}
          label='Edit Client Details' 
        />
        <NewSupportPeriodModal 
          show={this.state.newSupportPeriodShow} 
          onHide={this.hideNewSupportPeriodForm} 
          client={this.state.client} 
          onAdd={this.refreshData} 
          showLoading={this.showLoading}
          hideLoading={this.hideLoading}
          label='Add New Support Period' 
        />
        <LoadingGifModal show={this.state.loadingShow} onHide={this.hideLoading} label='Loading Client Details...'/>
      </div>
    );
  }
}
