/**
 * Created by polylink on 16/5/9.
 */
"use strict";
var store = require('react-native-simple-store');
import {domain,PARSE} from '../config';

export default function ajax(api,data,_method="POST"){
    return new Promise((resolve, reject)=>{
        store.get(PARSE.SESSION_TOKEN_KEY).then(imToken=>{
            let opt={
                method: _method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "x-access-token":imToken?imToken.token:'',
                    "x-app-version":'test'
                }
            }
            if(data){
                opt.body=JSON.stringify(data)
            }
            fetch(domain+api, opt).
            then((response) =>response.json()).
            then((responseText) => {
                if(!responseText){
                    responseText={"res":-1,"msg":"System error"}
                }
                resolve(responseText)
            }).
            catch((error) => {
                console.warn('error:',error);
                reject(error)
            });
        })
    });
}