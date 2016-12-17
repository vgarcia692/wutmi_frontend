import React from 'react';
import { Modal } from 'react-bootstrap';


export default class LoadingGifModal extends React.Component{
  constructor(props) {
    super(props)
  }


  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Body>
          <h1>{this.props.label}</h1>
        </Modal.Body>
      </Modal>
    )
  }
}