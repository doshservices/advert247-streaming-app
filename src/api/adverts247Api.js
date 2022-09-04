import axios from "axios";

// https://frozen-escarpment-07199.herokuapp.com/api
// https://thawing-thicket-82190.herokuapp.com/api
// http://api.adverts247.com/api

let instance = axios.create({
  baseURL: `https://491a-2a02-908-5d4-4f00-6d3e-8250-a652-988e.ngrok.io/api`,
});

instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

export default instance;
