import axios from 'axios';

// https://frozen-escarpment-07199.herokuapp.com/api
// https://thawing-thicket-82190.herokuapp.com/api


let instance = axios.create({
    baseURL: `https://thawing-thicket-82190.herokuapp.com/api`
})


instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

export default instance;