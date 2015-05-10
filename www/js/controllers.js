angular.module('starter.controllers', [])

.controller('TabCtrl', function($scope) {
  $scope.openBrowser = function () {
    window.open("http://chinaspecialoffer.com", "_blank", "location=no,toolbar=yes,toolbarposition=bottom")
  }
})

.controller('HomeCtrl', function($scope) {})

.controller('MessageCtrl', function($scope, $cordovaPush, $cordovaDialogs, $cordovaMedia, $cordovaToast, $http, $cordovaAppVersion, $cordovaDevice, $window, $location, Messages, ionPlatform) {
  
  /*
  $scope.messages = Messages.all();
  $scope.remove = function(message) {
    Messages.remove(message);
  }
  $scope.get = function(messageId) {
    Messages.get(messageId);
  }
*/
  /*========== Push Notification Handler ==========*/
  $scope.notifications = JSON.parse( $window.localStorage['messages'] || "[]");

  // call to register automatically upon device ready
  ionPlatform.ready.then(function (device) {
     $scope.register();
  });

  // Check Message
  $scope.checkMessage = function (messageId) {
    window.open("#/tab/message/" + messageId, "_self", "location=no,toolbar=yes,toolbarposition=bottom");
    return false;
  }


  // Register
  $scope.register = function () {
      var config = null;

      if (ionic.Platform.isAndroid()) {
          config = {
              "senderID": "YOUR_GCM_PROJECT_ID" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
          };
      }
      else if (ionic.Platform.isIOS()) {
          config = {
              "badge": "true",
              "sound": "true",
              "alert": "true"
          }
      }

      $cordovaPush.register(config).then(function (result) {
          console.log("Register success " + result);

          /*
          $cordovaToast.showShortCenter('Registered for push notifications');
          $scope.registerDisabled=true;
          */
          // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
          if (ionic.Platform.isIOS()) {
              $scope.regId = result;
              storeDeviceToken("ios");
          }
      }, function (err) {
          console.log("Register error " + err)
      });
  }

  // Notification Received
  // owen - changelog: $cordovaPush:notificationReceived ---> pushNotificationReceived
  $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
      //console.log(JSON.stringify([notification]));
      notification.expire_date = new Date( notification.expire_date * 1000 );
      notification.expire_date.setHours( notification.expire_date.getHours() - 8 );
      var now = new Date();
      notification.deliver_date = now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate();
      addMessage(notification);
      if (ionic.Platform.isAndroid()) {
          handleAndroid(notification);
      }
      else if (ionic.Platform.isIOS()) {
          handleIOS(notification);
          $scope.$apply(function () {
              $scope.notifications.unshift( notification );
          })
      }
  });

  function addMessage (message) {
    var messages = JSON.parse( $window.localStorage['messages'] || "[]" );
    messages.unshift( message );
    $window.localStorage['messages'] = JSON.stringify( messages );
  }

  // Android Notification Received Handler
  function handleAndroid(notification) {
      // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
      //             via the console fields as shown.
      console.log("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);
      if (notification.event == "registered") {
          $scope.regId = notification.regid;
          storeDeviceToken("android");
      }
      else if (notification.event == "message") {
          $cordovaDialogs.alert(notification.message, "Push Notification Received");
          $scope.$apply(function () {
              $scope.notifications.unshift(JSON.stringify(notification.message));
          })
      }
      else if (notification.event == "error")
          $cordovaDialogs.alert(notification.msg, "Push notification error event");
      else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
  }

  // IOS Notification Received Handler
  function handleIOS(notification) {
      // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
      // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
      // the notification when this code runs (weird).
      if (notification.foreground == "1") {
          // Play custom audio if a sound specified.
          if (notification.sound) {
              var mediaSrc = $cordovaMedia.newMedia(notification.sound);
              mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
          }

          if (notification.body && notification.messageFrom) {
              $cordovaDialogs.alert(notification.body, notification.messageFrom);
          }
          else $cordovaDialogs.alert(notification.alert, "Push Notification Received");

          if (notification.badge) {
              $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                  console.log("Set badge success " + result)
              }, function (err) {
                  console.log("Set badge error " + err)
              });
          }
      }
      // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
      // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
      // the data in this situation.
      else {
          if (notification.body && notification.messageFrom) {
              $cordovaDialogs.alert(notification.body, "(RECEIVED WHEN APP IN BACKGROUND) " + notification.messageFrom);
          }
          else $cordovaDialogs.alert(notification.alert, "New Message");
      }
  }

  // Stores the device token in a db using node-pushserver (running locally in this case)
  //
  // type:  Platform type (ios, android etc)
  function storeDeviceToken(type) {
      // Create a random userid to store with it
      var config = {
             app_name: 'AnyTours',
             app_version: "0.9",
             platform: $cordovaDevice.getPlatform(),
             device_token: $scope.regId,
             device_uid: $cordovaDevice.getUUID(),
             device_version: $cordovaDevice.getVersion(),
             device_model: $cordovaDevice.getModel(),
             push_badge: 'enabled',
             push_sound: 'enabled',
             push_alert: 'enabled',
             development: 'sandbox',
             status: 'active'
             };
      console.log("Post token for registered device with data " + JSON.stringify(config));

      $http.post('http://dreamover-studio.com/push/subscribe.php', JSON.stringify(config))
          .success(function (data, status) {
              console.log("Token stored, device is successfully subscribed to receive push notifications.");
          })
          .error(function (data, status) {
              console.log("Error storing device token." + data + " " + status)
          }
      );
  }

  // Removes the device token from the db via node-pushserver API unsubscribe (running locally in this case).
  // If you registered the same device with different userids, *ALL* will be removed. (It's recommended to register each
  // time the app opens which this currently does. However in many cases you will always receive the same device token as
  // previously so multiple userids will be created with the same token unless you add code to check).
  function removeDeviceToken() {
      var tkn = {"token": $scope.regId};
      $http.post('http://192.168.1.16:8000/unsubscribe', JSON.stringify(tkn))
          .success(function (data, status) {
              console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
          })
          .error(function (data, status) {
              console.log("Error removing device token." + data + " " + status)
          }
      );
  }

  // Unregister - Unregister your device token from APNS or GCM
  // Not recommended:  See http://developer.android.com/google/gcm/adv.html#unreg-why
  //                   and https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html#//apple_ref/occ/instm/UIApplication/unregisterForRemoteNotifications
  //
  // ** Instead, just remove the device token from your db and stop sending notifications **
  $scope.unregister = function () {
      console.log("Unregister called");
      removeDeviceToken();
      $scope.registerDisabled=false;
      //need to define options here, not sure what that needs to be but this is not recommended anyway
  //        $cordovaPush.unregister(options).then(function(result) {
  //            console.log("Unregister success " + result);//
  //        }, function(err) {
  //            console.log("Unregister error " + err)
  //        });
  }
  /*========== Push Notification Handler ==========*/




})

.controller('MessageDetailCtrl', function($scope, $stateParams, $http) {
  var messageId = $stateParams.messageId;

  var req = {
      method: 'GET',
      url: "http://dreamover-studio.com/push/message.php?message_id=" + message_id,
      headers: {
        'dataType': 'html'
      }
  }
    /*
  $http(req)
    .success(function(response){
      $scope.snipper = response;
    })
    .error(function(response){
      console.log("Cannot get the html");
    })
*/

  })

.controller('SettingCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})