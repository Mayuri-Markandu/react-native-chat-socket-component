import {RNS3} from 'react-native-aws3';
import React, {Component} from 'react';
import ReactNative, {TextInput, Platform, NativeModules} from 'react-native';


export function storeUploadedData(responseData){
     let response = responseData
     console.log('urlresponse is ' + JSON.stringify(response))
     console.log('urlFileName is' + response.filename)
     console.log('id is' + response.height + response.width)
     //this.refs.loading.show();
     let str = response.path;
     console.log('image data is ' + response.path)
     let keyName = str.split('react-native-image-crop-picker/').pop().split('"')[0];
     let keyNameArray = keyName.split("/")
     let actualKeyName = keyNameArray[keyNameArray.length - 1]
     console.log('keyName data is ' + keyName)
     setTimeout(() => {
        
        const file = {
                    uri: response.path,
                    name: ''+actualKeyName,
                    type: 'image/jpg'
                }
        console.log("file is" + JSON.stringify(file))
        //let testRegion = 'us-west-2',
        let devRegion = 'us-east-1'
        // let testKey = 'AKIAXFXSP6WBB2WSIFN7'
        let productionKey = 'AKIATRCSCEQZE2WFKFXX'
        //let testSecretKey = '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'
        let productionSecretKey = '7pT3hVrJVrFj6BZ/2eIvHj+sieSYitSPenvltt0T'
        //let testBucketName = 'spotted-optisol'
        let devBucketName = 'deelchat'
        const config = {
                    keyPrfix: '4/',
                    bucket: devBucketName,
                    region: devRegion,
                    accessKey: productionKey,
                    secretKey: productionSecretKey,
                    successActionStatus: 201
                }
        RNS3.put(file, config)
                    .then((s3Response) => {
            console.log(s3Response)
            if (s3Response.status === 201) {
                var width = response.width;
                var height = response.height;
                var dimension = width + '*' + height
                    
                var dict = {
                "image_url": s3Response.body.postResponse.key,
                "image_name": response.path,
                "image_type": 'image/jpg',
                "image_dimension": dimension,
                "image_details": "this is another super car",
                "image_model": ""
                }
        
                console.log("IMAGES ARRAY",imagesArray)         
    
            }else {
    
            }}).catch((error) => {
    
             }, 300)
            })
      }