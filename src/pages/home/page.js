import React from "react";
import styles from "./style.css";
import Sidebar from "react-sidebar";
import { Button } from "react-bootstrap";
import MaterialTitlePanel from "../../common/components/sidebar/MaterialTitlePanel";
import SidebarContent from "../../common/components/sidebar/SidebarContent";
import { browserHistory } from 'react-router';
const Cookie = require('../../common/Cookie.js')


 var sbstyles = {
  contentHeaderMenuLink: {
    textDecoration: 'none',
    color: 'white',
    padding: 8,
  },
  content: {
    padding: '16px',
  },
  topbar: {
    float: 'right'
  }
};

export default class HomePage extends React.Component {
  constructor() {
    super();
    this.state = {
      docked: true, 
      open: false,
      mql: true
    }
    
    this.onSetOpen = this.onSetOpen.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentWillMount() {
    // Authenticate User
    var authTimer = setInterval(function() {
      if(Cookie.checkCookie('token') == false) {
        clearInterval(authTimer);
        browserHistory.push('/');
      }
    }, 15000);

    var mql = window.matchMedia(`(min-width: 800px)`);
    mql.addListener(this.mediaQueryChanged);
    this.setState({mql: mql, docked: mql.matches});
  }


  componentWillUnmount() {
    this.state.mql.removeListener(this.mediaQueryChanged);
  }

  onSetOpen(open) {
    this.setState({open: open});
  }

  mediaQueryChanged() {
    this.setState({docked: this.state.mql.matches});
  }

  toggleOpen(ev) {
    this.setState({open: !this.state.open});

    if (ev) {
      ev.preventDefault();
    }
  }

  logout = (() => {
    Cookie.getCookie('token').removeItem('token');
    browserHistory.push('/');
  })

  render() {
    const sidebar = <SidebarContent />;

    const contentHeader = (
      <span>
        {!this.state.docked &&
         <a onClick={this.toggleOpen} href="#" style={sbstyles.contentHeaderMenuLink}>=</a>}
        <span> WUTMI Weto in Mour Database</span>
        <Button bsSize="xsmall" onClick={this.logout} style={sbstyles.topbar}>Logout</Button>
      </span>);

    const sidebarProps = {
      sidebar: sidebar,
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen,
    };

    return (
      <div className={sbstyles.content}>
        <Sidebar {...sidebarProps}>
        <MaterialTitlePanel title={contentHeader}>
          <div style={sbstyles.content}>
            {this.props.children}
          </div>
        </MaterialTitlePanel>
      </Sidebar>
      </div>
    );
  }
}
