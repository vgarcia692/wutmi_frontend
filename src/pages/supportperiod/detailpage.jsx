import React from 'react';
import { Link } from 'react-router';
import { Table, Button, Row, Col, Tabs, Tab, Panel } from 'react-bootstrap';
import styles from './style.css';
import CustomAxios from '../../common/components/CustomAxios';
import LoadingGifModal from '../../common/components/LoadingGifModal';
import NewCasenoteModal from '../../common/components/NewCasenoteModal';
import CasenoteDescriptionModal from '../../common/components/CasenoteDescriptionModal';
import SupportPeriodEditModal from '../../common/components/SupportPeriodEditModal';
import CloseSupportPeriodModal from '../../common/components/CloseSupportPeriodModal';
import dateFormat from 'dateFormat';
import Axios from 'axios';
const Constants = require('../../common/Constants.js')
const Cookie = require('../../common/Cookie.js');



export default class SupportPeriodDetailPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingShow: false,
      modalShow: false,
      descriptionShow: false,
      editFormShow: false,
      closeFormShow: false,
      case_note_description: '',
      follow_up_description: '',
      case_closed: false,
      
      supportperiod: {
        pk: props.params.pk,
        created_at: '',
        date_of_referral: '',
        referrer: '',
        risk_at_referral: '',
        violence_at_referral: [],
        reason_for_referral: '',
        injuries_at_referral: [],
        user_of_violence: [],
        protection_order_at_referral: '',
        protection_expiration_date_at_referral: '',
        casenote_set: [],
        input_by: {},
        closure: {
          injuries: [],
          violence: [],
          closure_date: '',
        }
      },

      closure: {
      }
      
    }

    this.showNewCasenoteModal = this.showNewCasenoteModal.bind(this);
    this.closeCasenoteModal = this.closeCasenoteModal.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.showDescription = this.showDescription.bind(this);
    this.hideDescription = this.hideDescription.bind(this);
  }

  componentDidMount() {
    this.getData();
  }
  
  getData() {
    this.showLoading()
    const id = this.props.params.pk;
    const axios = CustomAxios.wAxios;    
    axios.get('/supportperiods/'+this.props.params.pk+'/')
      .then((response) => {
        this.setState({ supportperiod:response.data })

        // Check if file was closed and that there was a close date, if so show hidden fields and disable close button
        if (response.data.closure.closure_date != null) {
          this.setState({ case_closed: true });
        }
        // console.log(this.state.supportperiod);
        this.hideLoading()
      })
      .catch((error) => {
        console.log(error);
      });
  }

  showNewCasenoteModal() {
    this.setState(() => ({
      modalShow: true
    }))
  }

  closeCasenoteModal() {
    this.setState(() => ({
      modalShow: false
    }))
  }

  refreshData() {
    this.setState(() => ({
      modalShow: false,
      editFormShow: false,
      closeFormShow: false
    }))

    // Refresh data from Database
    this.getData();
    console.log('data refreshed');
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

  showDescription(description, follow_up_description) {
    this.setState({
      case_note_description: description,
      follow_up_description: follow_up_description,
      descriptionShow: true
    });
  }

  hideDescription() {
    this.setState({
      descriptionShow: false
    });
  }

  showEditFrom = (() => {
    this.setState({
      editFormShow: true
    });
  })

  hideEditForm = (() => {
    this.setState({
      editFormShow: false
    });
  })

  showCloseFrom = (() => {
    this.setState({
      closeFormShow: true
    });
  })

  hideCloseForm = (() => {
    this.setState({
      closeFormShow: false
    });
  })

  render() {
    return (
      <div className={styles.content}>
        <h1 className={styles.heading}>{this.state.supportperiod.client} Support Period</h1>
        <Tabs defaultActiveKey={1} id='uncontrolled-tab'>
            <Tab eventKey={1} title='Referral Details'>
              <div className={styles.content}>
                <Button bsStyle="info" className={styles.addButton} onClick={this.showEditFrom}>Edit</Button>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td><strong>Created On:</strong></td>
                      <td>{dateFormat(this.state.supportperiod['created_at'], 'fullDate')}</td>
                    </tr>
                    <tr>
                      <td><strong>Referral Form</strong></td>
                      <td>
                        {
                            this.state.supportperiod['referral_form'] ?
                              <a href={Constants.API_URL+"/document/"+Cookie.getCookie('token')+"/referral/"+this.state.supportperiod.pk+'/'}>view</a>
                            :
                              ''
                        }
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Date of Referral:</strong></td>
                      <td>{dateFormat(this.state.supportperiod['date_of_referral'], 'fullDate')}</td>
                    </tr>
                    <tr>
                      <td><strong>Injuries at Referral:</strong></td>
                      <td>
                          {
                            this.state.supportperiod['injuries_at_referral'].map((v,index) => (
                              <li key={index}>{v.type}</li>
                            ))
                          }
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Referred By:</strong></td>
                      <td>{this.state.supportperiod['referrer']['name']}</td>
                    </tr>
                    <tr>
                      <td><strong>Risk at Referral:</strong></td>
                      <td>{this.state.supportperiod['risk_at_referral']}</td>
                    </tr>
                    <tr>
                      <td><strong>Violence at Referral:</strong></td>
                      <td>
                        {
                          this.state.supportperiod['violence_at_referral'].map((v,index) => (
                            <li key={index}>{v.type}</li>
                          ))
                        }
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Reason for Referral:</strong></td>
                      <td>{this.state.supportperiod['reason_for_referral']}</td>
                    </tr>
                    <tr>
                      <td><strong>Protection Order Expiration Date:</strong></td>
                      <td>{dateFormat(this.state.supportperiod['protection_expiration_date_at_referral'], 'fullDate')}</td>
                    </tr>
                  </tbody> 
                </Table>
              </div>
              <h2>User of Violence</h2>
              <div className={styles.content}>
                {/*<Button disabled bsStyle="success" className={styles.addButton}>+</Button>*/}
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <td>#</td>
                      <td>Name</td>
                      <td>Gender</td>
                      <td>Nationality</td>
                      <td>Relationship to Client</td>
                      {/*<td></td>*/}
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.supportperiod['user_of_violence'].map((uov,index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{uov.first_name + ' ' + uov.last_name}</td>
                          <td>{uov.gender}</td>
                          <td>{uov.nationality.type}</td>
                          <td>{uov.relationship_to_client.type}</td>
                          {/*<td><Button disabled>Edit</Button></td>*/}
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey={2} title='Case Notes'>
              <div className={styles.content}>
                <Row><Button bsStyle="success" className={styles.addButton} onClick={this.showNewCasenoteModal}>+</Button></Row>
                  {
                    this.state.supportperiod['casenote_set'].map((casenote,index) => (
                      <Panel key={index} header={dateFormat(casenote['created_at'], 'fullDate')}>
                        <p>
                          {
                            casenote.casenotedocument_set.map((document,index) => (
                              <a key={index} href={Constants.API_URL+"/document/"+Cookie.getCookie('token')+"/doc/"+document.pk+'/'}>{document.file.split('/')[7]}</a>
                            ))  
                          }
                        </p>
                        <strong><p>{casenote.support_mode.type}</p></strong>
                        <u><h4>CaseNote</h4></u>
                        <p>{casenote.description}</p>
                        <u><h4>{casenote.follow_up_description != null ? 'Follow Up' : ''}</h4></u>
                        <p>{casenote.follow_up_description != null ? casenote.follow_up_description : ''}</p>
                        <i><p>{casenote.follow_up_date != null ? dateFormat(casenote['follow_up_date'], 'fullDate'): ''}</p></i> 
                      
                        {/*<Button disabled>Edit</Button>*/}
                      </Panel>
                    ))
                  }
              </div>
            </Tab> 
            <Tab eventKey={3} title='Closure'>
              <div className={styles.content}>
              {
                (this.state.case_closed == true) ?
                  ''
                :
                  <Row><Button bsStyle="danger" className={styles.addButton} onClick={this.showCloseFrom}>Close Case</Button></Row>
              }
                
                <u><h2>Case Summary</h2></u>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{this.state.supportperiod.client}</td>
                    </tr>
                    <tr>
                      <td><strong>UoV:</strong></td>
                      <td>
                        {
                          this.state.supportperiod['user_of_violence'].map((uov,index) => (
                            <p key={index}>{uov.first_name + ' ' + uov.last_name}</p>
                          ))
                        }
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Tactics of violence experienced:</strong></td>
                      <td>
                        {
                          
                          (this.state.supportperiod.closure != null && this.state.supportperiod.closure.violence.length > 0) ?
                            this.state.supportperiod.closure.violence.map((v,index) => (
                              <li key={index}>{v.type}</li>
                            ))
                          :
                            ''
                        }
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Injuries:</strong></td>
                      <td>
                        {
                          
                          (this.state.supportperiod.closure != null && this.state.supportperiod.closure.injuries.length > 0) ?
                            this.state.supportperiod.closure.injuries.map((v,index) => (
                              <li key={index}>{v.type}</li>
                            ))
                          :
                            ''
                        }
                      </td>
                    </tr>
                  </tbody>
                    {
                      (this.state.case_closed == true) ?
                      <tbody>
                        <tr>
                          <td><strong>Closure Date</strong></td>
                          <td>{dateFormat(this.state.supportperiod.closure.closure_date, 'fullDate')}</td>
                        </tr>
                        <tr>
                          <td><strong>Risk at Closure</strong></td>
                          <td>{this.state.supportperiod.closure.risk_at_closure}</td>
                        </tr>
                        <tr>
                          <td><strong>Client knows case is closed?</strong></td>
                          <td>{this.state.supportperiod.closure.client_knows_case_close ? 'Yes' : ''}</td>
                        </tr>
                        <tr>
                          <td><strong>Client agrees with case being closed?</strong></td>
                          <td>{this.state.supportperiod.closure.client_agree_case_close ? 'Yes' : ''}</td>
                        </tr>
                      </tbody>
                      :
                        ''
                    }
                </Table>
              </div>
            </Tab>
        </Tabs>
        <SupportPeriodEditModal 
          show={this.state.editFormShow} 
          onHide={this.hideEditForm} 
          supportperiod={this.state.supportperiod} 
          onAdd={this.refreshData} 
          showLoading={this.showLoading}
          hideLoading={this.hideLoading}
          label='Edit Support Period Referral Details' 
        />
        <CloseSupportPeriodModal 
          show={this.state.closeFormShow} 
          onHide={this.hideCloseForm} 
          closure={this.state.supportperiod.closure} 
          onAdd={this.refreshData} 
          showLoading={this.showLoading}
          hideLoading={this.hideLoading}
          label='Close Support Period' 
        />
        <NewCasenoteModal closure={this.state.supportperiod.closure} show={this.state.modalShow} onHide={this.closeCasenoteModal} onAdd={()=>this.refreshData()} support_period={this.state.supportperiod} onAdd={()=>this.refreshData()} />
        <CasenoteDescriptionModal show={this.state.descriptionShow} onHide={this.hideDescription} case_note_description={this.state.case_note_description} follow_up_description={this.state.follow_up_description}/>
        <LoadingGifModal show={this.state.loadingShow} onHide={this.hideLoading} label='Loading Referral Details...'/>
      </div>
    );
  }
}
