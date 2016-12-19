import React from 'react';
import { Link } from 'react-router';
import { Table, Button, Row, Col } from 'react-bootstrap';
import styles from './style.css';
import CustomAxios from '../../common/components/CustomAxios';
import NewClientForm from '../../common/components/NewClientForm';
import LoadingGifModal from '../../common/components/LoadingGifModal';
import dateFormat from 'dateFormat';

export default class ClientListPage extends React.Component {
  constructor() {
    super()
    this.state = {
      data: [],
      modalShow: false,
      loadingShow: false
    }

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }

  componentDidMount() {
    this.getData();
  }
  
  getData() {
    this.showLoading();
    const axios = CustomAxios.wAxios;    
    axios.get('/basic_clients_data/')
      .then(function (response) {
        const results = response.data.results;
        var data = [];
        results.forEach(function(client,index) {

          data.push(
            <tr key={index}>
              <th>{index + 1}</th>
              <th><Link to={'/home/client/'+ client.pk} >{client.first_name + ' ' + client.last_name}</Link></th>
              <th>{client.atoll.name}</th>
              <th>{dateFormat(client.created_at, 'fullDate')}</th>
            </tr>
          );
        });
        this.setState({ data:data });
        this.hideLoading();
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      });
  }

  showModal() {
    this.setState(() => ({
      modalShow: true
    }))
  }

  closeModal() {
    this.setState(() => ({
      modalShow: false
    }))
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

  refreshData() {
    this.setState(() => ({
      modalShow: false
    }))

    // Refresh data from Database
    this.getData();
    console.log('data refreshed');
  }

  render() {
    
    return (
      <div className={styles.content}>
        <h1 className={styles.heading}>Client Listing</h1>
        <Row>
          <Button bsStyle="success" className={styles.addButton} onClick={this.showModal}>+</Button>
        </Row>
        <Row>
          <Table striped bordered condensed hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Atoll</th>
                <th>Input Date</th>
              </tr>
            </thead>
            <tbody>
              {this.state.data}
            </tbody>
          </Table>
        </Row>
        <NewClientForm show={this.state.modalShow} onHide={this.closeModal} onAdd={()=>this.refreshData()} />
        <LoadingGifModal show={this.state.loadingShow} onHide={this.hideLoading} label='Loading Clients...'/>
      </div>
    );
  }
}
