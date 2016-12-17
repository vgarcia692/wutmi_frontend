import React from 'react';
import styles from './style.css';
import CustomAxios from '../../common/components/CustomAxios';


export default class DashboardPage extends React.Component {
  constructor() {
    super()
  }


  render() {
    return (
      <div className={styles.content}>
        <h1 className={styles.heading}>Dashboard</h1>
      </div>
    );
  }
}
