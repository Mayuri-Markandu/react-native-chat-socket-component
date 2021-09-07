package com.chatbridge;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;


public class Chat extends ReactContextBaseJavaModule {
    public static Boolean isOn = false;

    public Chat(ReactApplicationContext reactContext){
        super(reactContext);
    }

    @ReactMethod
    public void turnOn() {
        isOn = true;
        System.out.println("BULB IS ON");
    }

    @ReactMethod
    public void turnOff() {
        isOn = false;
        System.out.println("BULB IS OFF");
    }

    @ReactMethod
    public void getStatus (Callback successCallBack){
        successCallBack.invoke(null,isOn);
    }

    @Override
    public String getName() {
        return "Chat";
    }

}
