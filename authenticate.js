/**
 * Created by Awar on 2017-04-23.
 */
const { SECRET } = require('./constans');
const jsonwebtoken = require('jsonwebtoken');
const { getUser, addUser } = require('./db/api');

const sign = (claims, key, options) => {
    return new Promise(( resolve, reject ) => {
        jsonwebtoken.sign(claims, key, options, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        })
    })
};

const verify = (token, key, options) => {
    return new Promise(( resolve, reject ) => {
        jsonwebtoken.verify(token, key, options, (error, verified) => {
            if (error) {
                reject(error);
            } else {
                resolve(verified);
            }
        })
    })
};

const register = async ({ name, password }) => {
  console.log(['auth.register'], { name, password });
  try {
      const success = await addUser({ name, password });
      if(success) {
          const token = await sign(name, password, SECRET);
          return token;
      } else {
          return null;
      }
  }
  
  catch(error) {
      console.log(['auth.error'], error);
  }
};

const login = async ({ name, password }) => {
    console.log(['auth.register'], { name, password });
    try {
        const success = await getUser({ name, password });
        if(success) {
            console.log('user', name);
            const token = await sign(name, password, SECRET);
            console.log('token', token);
            return token;
        } else {
            return null;
        }
    }
    
    catch(error) {
        console.log(['auth.error'], error);
    }
};

const verifyToken = (onSuccess, onFail) => async (...args) => {
    console.log(['auth.verify.token']);
    const [data] = args;
    const isVerified = await data.token && verify(data.token);
    
    if(isVerified) {
        console.log('verified');
    }
};


module.exports = {
    login,
    register,
    verifyToken
};