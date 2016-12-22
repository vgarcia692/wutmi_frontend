module.exports = {
  // For local development python runserver
  // API_URL: 'http://localhost:8001',
  // For Gunicorn and Production
  API_URL: 'http://104.131.150.111:8080',
  
  //Firefox Browser Check
  IsFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1
}