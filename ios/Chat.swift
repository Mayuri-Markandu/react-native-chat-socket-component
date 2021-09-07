////
////  chat.swift
////  chatBridge
////
////  Created by Mac-OBS-8 on 25/09/19.
////  Copyright © 2019 Facebook. All rights reserved.
////
//
//import Foundation
//import SocketIO
//
//@objc(Chat)class Chat: NSObject {
//  
//  //MARK: - Variables
//  @objc static var isOn = false
//  @objc static let kGlobalBaseURL = "http://34.218.121.25:9060/"
//  @objc static let kChatGlobalURL = "http://54.173.185.173:9003"
//  @objc static let kChatAPIBaseURL = "http://54.173.185.173:9003/api"
//  @objc static let kChatImageUploadURL = "http://54.173.185.173:9003/chat/uploadImage"
//  @objc static let kChatVideoUploadURL = "http://54.173.185.173:9003/chat/uploadVideo"
//  @objc static let kChatThumbNailImageUploadURL = "http://54.173.185.173:9003/api/chatrooms/videoThumbnail"
//  @objc static let kChatDocUploadURL = "http://54.173.185.173:9003/chat/uploadDoc"
//  
//  // MARK: -  Chat Keys
//   @objc static let KChatNewUser : String = "new-user"
//   @objc static let KChatSendMessage : String = "send-message"
//   @objc static let KChatJoinChat : String = "join-chat"
//   @objc static let KChat1On1 : String = "1on1-room-name"
//   @objc static let KChatUpdateReadStatus : String = "update-message-status"
//   @objc static let KNewMessageSocket : String = "new-message"
//   @objc static let KNewImageMessage : String = "new-message-image"
//  
//  // MARK: - SOCKET INITIALIZATION
//  var manager: SocketManager = SocketManager.init(socketURL: URL.init(string: kChatGlobalURL)!, config: [.log(false), .compress, .forcePolling(true), .forceNew(true), .reconnects(true), .reconnectAttempts(99)])
//  
//  var socket:SocketIOClient!
//  
//  
//  //MARK: - Socket instance intialization
//  @objc func intializeSocket() {
//    socket = manager.defaultSocket
//    socket.connect()
//  }
//  
//  //MARK: - Socket Connection and Disconnection
//  //disconnect socket manually during background and app termination
//  @objc func disconnectSocketManually(loggedInUser: String) {
//    let manualDisconnectParam: Parameters = ["userId": loggedInUser]
//    if self.socket.status == .connected {
//      self.socket.emitWithAck("disconnect-mannual", with: [manualDisconnectParam]).timingOut(after: 1) { (data) in
//        print("DC: disconnect-mannual")
//        print("DC: \(data)")
//      }
//    }
//    self.socket.disconnect()
//  }
//  
//  //Disconnect and connect While app is in Foreground
//  @objc func connectInForeground() {
//    self.socket.disconnect()
//    self.manager.disconnect()
//    manager = SocketManager.init(socketURL: URL.init(string: kChatGlobalURL)!, config: [.log(false), .compress, .forcePolling(true), .forceNew(true), .reconnects(true), .reconnectAttempts(99)])
//    self.socket = manager.defaultSocket
//    self.socket.connect()
//  }
//  
//  //Reconnect Socket
//  @objc func reconnectSocket() {
//    if self.socket.status != .connected {
//      print("DC: Socket- Reconnecting")
//      self.socket.connect()
//    }
//  }
//  
//  @objc func turnOn() {
//    Chat.isOn = true
//    print("Bulb is now ON")
//    
//  }
//
//@objc func turnOff() {
//  Chat.isOn = false
//  print("Bulb is now OFF")
//}
//  
//@objc func getStatus(_ callback: RCTResponseSenderBlock) {
//  callback([NSNull(), Chat.isOn])
//}
//
//@objc func requiresMainQueueSetup() -> Bool {
//  return true
//}
//
//}
