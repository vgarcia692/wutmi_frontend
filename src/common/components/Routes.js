import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './App';
import LoginPage from '../../pages/login/page';
import HomePage from '../../pages/home/page';
import ClientListPage from '../../pages/client/listpage';
import ClientDetailPage from '../../pages/client/detailpage';
import DashboardPage from '../../pages/dashboard/page';
import SupportPeriodDetailsPage from '../../pages/supportperiod/detailpage';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={LoginPage} />
    <Route path="/home" component={HomePage}>
      <Route path="/home/dashboard" component={DashboardPage} />
      <Route path="/home/clientlist" component={ClientListPage} />
      <Route path="/home/client/:pk" component={ClientDetailPage} />
      <Route path="/home/supportperiod/:pk" component={SupportPeriodDetailsPage} />
    </Route>
  </Route>
);
