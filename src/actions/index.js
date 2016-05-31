// normally action creators return an object, but with redux thunk, we can make it return
// a function
const ROOT_URL = 'http://localhost:3090';
import axios from 'axios';
import { 
  AUTH_USER, 
  AUTH_ERROR,
  UNAUTH_USER,
  FETCH_MESSAGE
} from './types';

import { browserHistory } from 'react-router'; // browserHistory communicates info about URL to react-router

export function signinUser({ email, password }) {
  // this is what redux thunk does and inside of this returned function, we can make any 
  // asyncronous request or action; allows us to dispatch our own actions at any point in time
  return function(dispatch) {
    // dispatch({ type: ... })

    // Submit email/password to the server
    axios.post(`${ROOT_URL}/signin`, { email, password })
      // if our server responds with 200 or 204 (depending)
      .then(response => {
        // If request is good...
        // - Update state to indicate user is authenticated
        dispatch({ type: AUTH_USER });
        // - Save the JWT token;
        // localStorage is an object available on the window scope so we don't need to import it
        localStorage.setItem('token', response.data.token);  
        // - Redirect to the route '/feature'
        browserHistory.push('/feature'); // push does programmatic navigation for us
      })
      .catch(() => {
        // If request is bad...
        // - Show an error to the user
        dispatch(authError('Bad Login Info'));
      });
  }
}

export function signoutUser() {
  localStorage.removeItem('token');

  return {type: UNAUTH_USER};
}

export function signupUser({email, password}) {
  return function(dispatch) {
    axios.post(`${ROOT_URL}/signup`, { email, password })
      .then(response => {
        dispatch({ type: AUTH_USER });
        localStorage.setItem('token', response.data.token);  
        browserHistory.push('/feature');
      })
      .catch(response => dispatch(authError(response.data.error)));
  }
}

export function authError(error) {
  return {
    type: AUTH_ERROR,
    payload: error
  }
}

// we are using reduxthunk here. but can also use redux promise here as well
export function fetchMessage() {
  return function(dispatch) {
    axios.get(ROOT_URL, {
      headers: { authorization: localStorage.getItem('token') }
    })
      .then(response => { 
        dispatch({
          type: FETCH_MESSAGE,
          payload: response.data.message
        });
      });
  }
}

// // if we had written fetchMessage with redux promise
// export function fetchMessage() {
//   const request = axios.get(ROOT_URL, {
//       headers: { authorization: localStorage.getItem('token') }
//   });
    
//   return {
//     type: FETCH_MESSAGE,
//     payload: request
//   }
// }

// without token in header, we get:
// undefined:1 Uncaught (in promise) Object {data: "Cannot POST /↵", status: 404, statusText: "Not Found", headers: Object, config: Object…}