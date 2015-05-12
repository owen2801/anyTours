var token_global = "";

angular.module('starter.controllers', ['pasvaz.bindonce', 'ngSanitize', 'react'])

.controller('TabCtrl', function($scope) {
  $scope.openBrowser = function () {
    if(ionic.Platform.isIOS()){
      window.open("http://chinaspecialoffer.com", "_blank", "location=no,toolbar=yes,toolbarposition=bottom")
    } else {
      window.open("http://chinaspecialoffer.com", "_blank", "location=yes")
    }
    
  }
})

.controller('HomeCtrl', function($scope) {})

.controller('MessageCtrl', function($scope, $cordovaPush, $cordovaDialogs, $cordovaMedia, $cordovaToast, $http, $cordovaAppVersion, $cordovaDevice, $window, $translate, ionPlatform) {

  syncMessage();
  $scope.receivePush = true;
  if ( $window.localStorage['receivePush'] == "isFalse" ) {
    $scope.receivePush = false;
    //removeDeviceToken();
  }

  document.addEventListener ("resume", onResume, false)
  function onResume (){
    syncMessage();
  }

  /*========== Push Notification Handler ==========*/
  $scope.notifications = [];
  $scope.savedNotifications = JSON.parse( $window.localStorage['messages'] || "[]" );
  // call to register automatically upon device ready
  ionPlatform.ready.then(function (device) {
     $scope.register();
  });

  // Check Message
  $scope.checkMessage = function (messageId) {
    window.open("http://dreamover-studio.com/push/message.php?message_id=" + message_id, "_blank", "location=no,toolbar=yes,toolbarposition=bottom");
    return false;
  }
  // Register
  $scope.register = function () {
      var config = null;

      if (ionic.Platform.isAndroid()) {
          config = {
              "senderID": "862098836172" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
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
          $scope.registerDisabled=true;
          // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
          if (ionic.Platform.isIOS()) {
              token_global = result;
              $scope.regId = result;
              if ( $scope.receivePush ) {
                storeDeviceToken();
              }

          }
      }, function (err) {
          console.log("Register error " + err)
      });
  }

  // Notification Received
  // owen - changelog: $cordovaPush:notificationReceived ---> pushNotificationReceived
  
  $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
    if ( ionic.Platform.isAndroid() ) {
      handleAndroid(notification);

    } else if (ionic.Platform.isIOS()){
      if ( !duplicateMessage( notification.message_id ) ) {

        notification.deliver_date_readable = new Date( notification.deliver_date * 1000);
        notification.deliver_date_readable.setHours( notification.deliver_date_readable.getHours() - 8 );
        notification.deliver_date_readable = notification.deliver_date_readable.getFullYear() + "/" + notification.deliver_date_readable.getMonth() + "/" + notification.deliver_date_readable.getDate();

        handleIOS(notification);
      }
    }
    
  });

  // Android Notification Received Handler
  function handleAndroid(notification) {
      // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
      //             via the console fields as shown.
      //console.log("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);
      if (notification.event == "registered") {
          $scope.regId = notification.regid;
          token_global = notification.regid;
          if ($scope.receivePush) {
           storeDeviceToken();
          }
      } else if ( notification.event = "message" ) {
        notification = notification.payload;
        if ( !duplicateMessage( notification.message_id ) ) {
          $cordovaDialogs.alert(notification.message, $translate.instant("receivedNoti") );
          $scope.$apply(function () {
            $scope.notifications.unshift( notification );
          })
          addMessage(notification);
        }
      } else if ( notification.event == "error" ) {
        $cordovaDialogs.alert(notification.msg, "Push notification error event");
      } else {
        $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
      }
  }

  // IOS Notification Received Handler
  function handleIOS(notification) {
      // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
      // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
      // the notification when this code runs (weird).
      if (notification.foreground == "1") {
          // Play custom audio if a sound specified.
          /*
          if (notification.sound) {
              var mediaSrc = $cordovaMedia.newMedia(notification.sound);
              mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
          }
          */

          if (notification.body && notification.messageFrom) {
              $cordovaDialogs.alert(notification.body, notification.messageFrom);
          }
          else $cordovaDialogs.alert(notification.alert, $translate.instant("receivedNoti"));

          if (notification.badge) {
              $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                  console.log("Set badge success " + result)
              }, function (err) {
                  console.log("Set badge error " + err)
              });
          }

          // Update the notifications
          $scope.$apply(function () {
              $scope.notifications.unshift( notification );
          })
          addMessage(notification);
      }
      // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
      // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
      // the data in this situation.
      else {

          addMessage(notification);
      }
  }

  // Stores the device token in a db using node-pushserver (running locally in this case)
  //
  // type:  Platform type (ios, android etc)
  function storeDeviceToken() {
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

  function addMessage (message) {
    var messages = JSON.parse( $window.localStorage['messages'] || "[]" );
    messages.unshift( message );
    $window.localStorage['latest_message'] = JSON.stringify ( message );
    $window.localStorage['messages'] = JSON.stringify( messages );
  }
  function syncMessage () {

    if ( $window.localStorage['latest_message'] ) {
      // timezone problem
      var latest_message = JSON.parse ( $window.localStorage['latest_message'] )
      deliverDate = latest_message.deliver_date;
      syncMessageHelper(deliverDate);
    } else {
      syncMessageHelper( localStorage["installedDate"] );
    }

  }

  function syncMessageHelper (deliverDate) {
    var req = {
        method: 'GET',
        url: "http://dreamover-studio.com/push/syncMessage.php",
        headers: {
          'dataType': 'json'
        },
        params: {
          delivery_date: deliverDate,
          development: 'sandbox',
          sort_order: 'ASC'
        }
      }

      $http(req)
      .success(function(data){
        var temp_data = [];
        var notification;
        angular.forEach(data.messages, function(notification, key){
          if ( notification.created > deliverDate && !duplicateMessage( notification.message_id ) ){
            notification.deliver_date_readable = new Date( notification.deliver_date * 1000 );
            //notification.deliver_date_readable.setHours( notification.deliver_date_readable.getHours() - 8 );
            notification.deliver_date_readable = notification.deliver_date_readable.getFullYear() + "/" + ( notification.deliver_date_readable.getMonth() + 1 ) + "/" + notification.deliver_date_readable.getDate();
            addMessage( notification )

            $scope.notifications.unshift (notification);
          }
        })
      })
      .error(function (data) {
        console.log("Failed to sync messages!")
      })
  }
  function duplicateMessage (messageId) {
    if( $window.localStorage['messages'] ){
      angular.forEach ($window.localStorage['messages'], function(notification, key){
      if ( notification.message_id == messageId ){
        return true;
      } else {
        return false;
      }
    })
    } else {
      return false;
    }
    
  }

   // Removes the device token from the db via node-pushserver API unsubscribe (running locally in this case).
  // If you registered the same device with different userids, *ALL* will be removed. (It's recommended to register each
  // time the app opens which this currently does. However in many cases you will always receive the same device token as
  // previously so multiple userids will be created with the same token unless you add code to check).
  function removeDeviceToken() {
      var config = {
           app_name: 'AnyTours',
           device_token: $scope.regId,
           status: 'active'
           }
      $http.post('http://dreamover-studio.com/push/subscribe.php?action=unsubscribe', JSON.stringify(config))
        .success(function (data, status) {
            console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
        })
        .error(function (data, status) {
            console.log("Error removing device token." + data + " " + status)
        })
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


.controller('MessageDetailCtrl', function($scope, $stateParams, $http, $sce, $window) {
  var messageId = $stateParams.messageId;
  var req = {
      method: 'GET',
      url: "http://dreamover-studio.com/push/message.php?message_id=" + messageId + "&language=" + $window.localStorage["language"],
      headers: {
        'dataType': 'html'
      }
  }
  $http(req)
  .success(function(response){
    $scope.snipper = $sce.trustAsHtml( response )
  })
  .error(function(response){
    console.log("Cannot get the html");
  })

  document.getElementById("message-detail").addEventListener("click", onClick, false)

  function onClick (e) {
    e = e ||  window.event;
    var element = e.target || e.srcElement;

    if (element.tagName == 'A') {
        e.preventDefault();
        if(ionic.Platform.isIOS()){
          window.open(element.href, "_blank", "location=no,toolbar=yes,toolbarposition=bottom")
        } else {
          window.open(element.href, "_blank", "location=yes")

        }
    }
  };

})

.controller('SettingCtrl', function($scope, $window, $cordovaDevice, $http, $ionicPopup, $translate) {

  // Variables
  var receivePush = true;
  if ( $window.localStorage['receivePush'] == "isFalse" ) {
    receivePush = false;
  }
  var langPopup;


  // functions
  $scope.settings = {
    receivePush: receivePush
  };

  $scope.pushNotificationChange = function() {
    if ( $window.localStorage['receivePush'] != "isFalse" ) {
      $window.localStorage['receivePush'] = "isFalse";
      removeDeviceToken();
    } else {
      $window.localStorage['receivePush'] = "isTrue";
      storeDeviceToken()
    }
  }

  $scope.showLangPopup = function (){
    langPopup = $ionicPopup.show({
    templateUrl: "templates/langPopup.html",
    title: $translate.instant('selectLang'),
    scope: $scope,
    buttons: [{
      text: "Cancel",
      type: "button-default",
      onTap: function(e){
      }
      }]
    });
   langPopup.then(function(res) {
    });
  }

 $scope.changLang = function (lang) {
    $window.localStorage['language'] = lang;
    langPopup.close(); 
    $translate.use(lang);
  }

  // Stores the device token in a db using node-pushserver (running locally in this case)
  //
  // type:  Platform type (ios, android etc)
  function storeDeviceToken() {
      // Create a random userid to store with it
      var config = {
             app_name: 'AnyTours',
             app_version: "0.9",
             platform: $cordovaDevice.getPlatform(),
             device_token: token_global,
             device_uid: $cordovaDevice.getUUID(),
             device_version: $cordovaDevice.getVersion(),
             device_model: $cordovaDevice.getModel(),
             push_badge: 'enabled',
             push_sound: 'enabled',
             push_alert: 'enabled',
             development: 'sandbox',
             status: 'active'
             };
      $http.post('http://dreamover-studio.com/push/subscribe.php', JSON.stringify(config))
          .success(function (data, status) {
              console.log(data);
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
      var config = {
             app_name: 'AnyTours',
             device_token: token_global,
             status: 'active'
             }
      $http.post('http://dreamover-studio.com/push/subscribe.php?action=unsubscribe', JSON.stringify(config))
          .success(function (data, status) {
              console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
          })
          .error(function (data, status) {
              console.log("Error removing device token." + data + " " + status)
          })
  }
  
})