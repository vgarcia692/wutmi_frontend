import React from 'react';
import MaterialTitlePanel from './MaterialTitlePanel';
import { Link } from 'react-router';

const styles = {
  sidebar: {
    width: 256,
    height: '100%',
  },
  sidebarLink: {
    display: 'block',
    padding: '16px 0px',
    color: '#757575',
    textDecoration: 'none',
  },
  divider: {
    margin: '8px 0',
    height: 1,
    backgroundColor: '#757575',
  },
  content: {
    padding: '16px',
    height: '100%',
    backgroundColor: 'white',
  }
};


const SidebarContent = (props) => {
  const style = props.style ? {...styles.sidebar, ...props.style} : styles.sidebar;

  const links = [
    <Link key={2} to="/home/clientlist" style={styles.sidebarLink} activeStyle={{ color: 'green' }}>Intervention</Link>
    // <Link key={3} to="/home/caseworklist" style={styles.sidebarLink} activeStyle={{ color: 'green' }}>Caseworkers</Link>
  ];



  return (
    <MaterialTitlePanel title="Menu" style={style}>
      <div style={styles.content}>
        <Link key={1} to="/home/dashboard" activeStyle={{ color: 'green' }} style={styles.sidebarLink}>Dashboard</Link>
        <div style={styles.divider} />
        {links}
        <div style={styles.divider} />
      </div>
    </MaterialTitlePanel>
  );
};

SidebarContent.propTypes = {
  style: React.PropTypes.object,
};

export default SidebarContent;