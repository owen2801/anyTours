
angular.module('starter.controllers', ['pasvaz.bindonce', 'ngSanitize', 'react'])

.controller('TabCtrl', function($scope) {
  $scope.openBrowser = function () {
    if(ionic.Platform.isIOS()){
      window.open(companyWebADDR, "_blank", "location=no,toolbar=yes,toolbarposition=bottom")
    } else {
      window.open(companyWebADDR, "_blank", "location=yes")
    }
    
  }
})

.controller('HomeCtrl', function($scope) {})

.controller('MessageCtrl', function($scope, $cordovaPush, $cordovaDialogs, $cordovaMedia, $cordovaToast, $http, $cordovaDevice, $window, $translate, $ionicPopover, ionPlatform, $state, $rootScope) {

  $scope.openBrowser = function (webADDR) {
    console.log(webADDR)
    if(ionic.Platform.isIOS()){
      window.open(webADDR, "_blank", "location=no,toolbar=yes,toolbarposition=bottom")
    } else {
      window.open(webADDR, "_blank", "location=yes")
    }
    
  }

  $rootScope.$on('$translateChangeSuccess', function (event, a) {
      $scope.dropMenus = getDropMenus($scope.dropMenus, a.language);
  });

  //Dropdown Menus
  $http.get( dropMenuPath )
      .success(function (data, status) {
          $scope.dropMenus = getDropMenus(data, $window.localStorage['language']);
          
      })
      .error(function (data, status) {
          console.log("Error storing device token." + data + " " + status)
      }
  );

  //check Installed date
  if ( localStorage["installedDate"]  ) { 

  } else {
    var today = new Date();
    var todayTimestamp = Math.round(today.getTime() / 1000);
    var messages = []
    messages.push(welcomeMessage);
    localStorage["messages"] = JSON.stringify(messages)
    //today.setDate(today.getDate() - 10)
    localStorage["installedDate"] = today / 1000;
  }


  // First time sync messages
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
    window.open( getMessagesPath + "?message_id=" + message_id, "_blank", "location=no,toolbar=yes,toolbarposition=bottom");
    return false;
  }
  // Register
  $scope.register = function () {
      var config = null;

      if (ionic.Platform.isAndroid()) {
          config = {
              "senderID": GCMId // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
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
              tokenGlobal = result;
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
        handleIOS(notification);
      }
    }
    
  });

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('templates/otherService.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openOtherService = function($event) {
    $scope.popover.show($event);
  };
  $scope.closeOtherService = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  // Function for getting the drop down menu
  function getDropMenus(menus, language){
    //Dropdown Menus
    var tempMenus=[];
    angular.forEach(menus, function(menu, key){
      if(language == 'cn'){
        menu.name = menu.name_cn
      } else {
        menu.name = menu.name_en
      }
      tempMenus.push(menu);
    })
    return tempMenus;
  }

  // Android Notification Received Handler
  function handleAndroid(notification) {

      if ( !duplicateMessage( notification.message_id ) ) {

        if (notification.event == "registered") {
            $scope.regId = notification.regid;
            tokenGlobal = notification.regid;
            if ($scope.receivePush) {
             storeDeviceToken();
            }
        } else if ( notification.event = "message" ) {
          var payload = notification.payload;
          if ( !duplicateMessage( payload.message_id ) ) {
            addMessage(payload);
            if ( notification.foreground ) {
              $cordovaDialogs.alert(payload.message, $translate.instant("receivedNoti") );
            } else {
              if (payload.message_id){
                $state.go("tab.message-detail", {messageId: payload.message_id})
              }
            }
          }
        }
      } 
  }

  // IOS Notification Received Handler
  function handleIOS(notification) {

      if (notification.foreground == "1") {
          // Play custom audio if a sound specified.
          /*
          if (notification.sound) {
              var mediaSrc = $cordovaMedia.newMedia(notification.sound);
              mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
          }
          */

          $cordovaDialogs.alert(notification.alert, $translate.instant("receivedNoti"));
          if (notification.badge) {
              $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                  console.log("Set badge success " + result)
              }, function (err) {
                  console.log("Set badge error " + err)
              });
          }
          addMessage(notification);
      } else {
        $state.go("tab.message-detail", {messageId: notification.message_id})
      }
  }

  // type:  Platform type (ios, android etc)
  function storeDeviceToken() {
      // Create a random userid to store with it
      var config = {
             app_name: appName,
             app_version: $window.cordovaAppVersion,
             platform: $cordovaDevice.getPlatform(),
             device_token: $scope.regId,
             device_uid: $cordovaDevice.getUUID(),
             device_version: $cordovaDevice.getVersion(),
             device_model: $cordovaDevice.getModel(),
             push_badge: 'enabled',
             push_sound: 'enabled',
             push_alert: 'enabled',
             development: development,
             status: 'active'
             };
      console.log("Post token for registered device with data " + JSON.stringify(config));

      $http.post( subscribePath, JSON.stringify(config))
          .success(function (data, status) {
              console.log("Token stored, device is successfully subscribed to receive push notifications.");
          })
          .error(function (data, status) {
              console.log("Error storing device token." + data + " " + status)
          }
      );
  }

  function addMessage (message) {
    // Update the notifications
    if ( !duplicateMessage(message.message_id) && message.message_id) {
      $window.localStorage['latest_message'] = JSON.stringify ( message );
      $window.localStorage['messages'] = JSON.stringify( $scope.savedNotifications );
      $scope.savedNotifications.unshift( message );
      $scope.$apply()
    }
  }

  function syncMessage () {
    if ( $window.localStorage['latest_message'] ) {
      // timezone problem
      var latest_message = JSON.parse ( $window.localStorage['latest_message'] )
      var deliverDate = latest_message.deliver_date;

      syncMessageHelper(deliverDate);

    } else {
      syncMessageHelper( localStorage["installedDate"] );
    }

  }

  function syncMessageHelper (deliverDate) {
    var req = {
        method: 'GET',
        url: syncMessagePath,
        headers: {
          'dataType': 'json'
        },
        params: {
          delivery_date: deliverDate,
          development: development,
          sort_order: 'ASC'
        }
      }

      $http(req)
      .success(function(data){
        
        angular.forEach(data.messages, function(notification, key){
          if ( !duplicateMessage( notification.message_id ) ){
            notification.status = "unread";
            notification.deliver_date_readable = new Date( notification.deliver_date * 1000 );
            //notification.deliver_date_readable.setHours( notification.deliver_date_readable.getHours() - 8 );
            notification.deliver_date_readable = notification.deliver_date_readable.getFullYear() + "/" + ( notification.deliver_date_readable.getMonth() + 1 ) + "/" + notification.deliver_date_readable.getDate();
            addMessage( notification ) // Be careful !!! $scope.$apply() will crash in $http !!
          }
        })
      })
      .error(function (data) {
        console.log("Failed to sync messages!")
      })
  }

  // Avioding duplicated messages
  function duplicateMessage (messageId) {
    if( $window.localStorage['messages'] ){
      var result = ( $scope.savedNotifications ).map(function(x) {return x.message_id} ).indexOf(messageId);
      if (result == -1) return false;
      else return true;
    } else {
      return false;
    }
  }

  $scope.changeStatus = function (key) {
    //document.getElementById("divider-" + id).className = "item item-divider";
    $scope.notifications[key].status = "";
    var savedNotifications = JSON.parse( $window.localStorage["messages"] );
    var key2 = 0;

    // For better perfomance
    for (var i = 0 ; i < savedNotifications.length; i++){
      key2 = savedNotifications.length - 1 - i
      if ( savedNotifications[key2].message_id == $scope.notifications[key].message_id ) {
        savedNotifications[key2].status = "";
        localStorage["messages"] = JSON.stringify(savedNotifications);
        return true;
      }
    }
  }

  $scope.changeSavedStatus = function (messageId) {
      var elementPos = ($scope.savedNotifications).map(function(x) {return x.message_id}).indexOf(messageId);
      if ($scope.savedNotifications[elementPos].status == "unread"){
        $scope.savedNotifications[elementPos].status = "";
        localStorage["messages"] = JSON.stringify( $scope.savedNotifications );
      }
    }

  function removeDeviceToken() {
      var config = {
           app_name: appName,
           device_token: $scope.regId,
           status: 'active'
           }
      $http.post(subscribePath + '?action=unsubscribe', JSON.stringify(config))
        .success(function (data, status) {
            console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
        })
        .error(function (data, status) {
            console.log("Error removing device token." + data + " " + status)
        })
  }

  $scope.unregister = function () {
      console.log("Unregister called");
      removeDeviceToken();
      $scope.registerDisabled=false;
  }

  /*========== Push Notification Handler ==========*/
  })


.controller('MessageDetailCtrl', function($scope, $stateParams, $http, $sce, $window, $ionicLoading, $translate) {
  
  $ionicLoading.show({
    template:"<ion-spinner></ion-spinner><p>" + $translate.instant('textLoading') + "</p>",
    noBackdrop: true,
    delay: 500,
    hideOnStateChange: true
    //duration: 30000
  })

  var messageId = $stateParams.messageId;
  var req = {
      method: 'GET',
      url: getMessagesPath + "?message_id=" + messageId + "&language=" + $window.localStorage["language"],
      headers: {
        'dataType': 'html'
      }
  }
  $http(req)
  .success(function(response){
    $scope.snipper = $sce.trustAsHtml( response )
    $ionicLoading.hide()
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

  function storeDeviceToken() {
      // Create a random userid to store with it
      var config = {
             app_name: appName,
             app_version: $window.cordovaAppVersion,
             platform: $cordovaDevice.getPlatform(),
             device_token: tokenGlobal,
             device_uid: $cordovaDevice.getUUID(),
             device_version: $cordovaDevice.getVersion(),
             device_model: $cordovaDevice.getModel(),
             push_badge: 'enabled',
             push_sound: 'enabled',
             push_alert: 'enabled',
             development: development,
             status: 'active'
             };
      $http.post( subscribePath, JSON.stringify(config))
          .success(function (data, status) {
              console.log(data);
          })
          .error(function (data, status) {
              console.log("Error storing device token." + data + " " + status)
          }
      );
  }

  function removeDeviceToken() {
      var config = {
             app_name: appName,
             device_token: tokenGlobal,
             status: 'active'
             }
      $http.post( subscribePath + '?action=unsubscribe', JSON.stringify(config))
          .success(function (data, status) {
              console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
          })
          .error(function (data, status) {
              console.log("Error removing device token." + data + " " + status)
          })
  }
  
})