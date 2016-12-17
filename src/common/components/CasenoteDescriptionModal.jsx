import React from 'react';
import { Button, Modal } from 'react-bootstrap';


export default class CasenoteDescriptionModal extends React.Component{
  constructor(props) {
    super(props)
  }


  render() {

    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4><u>Case Note Description</u></h4>
          <p>{this.props.case_note_description}</p>
          <h4><u>Follow Up Description</u></h4>
          <p>{this.props.follow_up_description}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='danger' onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}