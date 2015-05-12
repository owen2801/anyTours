// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'pascalprecht.translate',
'starter.controllers', 'starter.services', 'starter.directive' ])

.run(function( $ionicPlatform, $cordovaDialogs, $translate) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if ( !localStorage["installedDate"] ) {
      var today = new Date();
      today.setDate(today.getDate() - 10)
      localStorage["installedDate"] = today / 1000; 
    }
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    if ( !localStorage["language"] ) {
      navigator.globalization.getPreferredLanguage(
      function (language) {
        if (language.value.indexOf("zh") > -1){
           localStorage["language"] = "cn";
           $translate.use("cn")
        } else {
          $translate.use("en")
        }
      },
      function () {
        alert('Error getting language\n');
      }
    );
    }
    
    
  });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: "TabCtrl"
  })

  // Each tab has its own nav history stack:
  /*
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
*/

  .state('tab.message', {
      url: '/message',
      views: {
        'tab-message': {
          templateUrl: 'templates/tab-message.html',
          controller: 'MessageCtrl'
        }
      }
    })
    .state('tab.message-detail', {
      url: '/message/:messageId',
      views: {
        'tab-message': {
          templateUrl: 'templates/message-detail.html',
          controller: 'MessageDetailCtrl'
        }
      }
    })

  .state('tab.setting', {
    url: '/setting',
    views: {
      'tab-setting': {
        templateUrl: 'templates/tab-setting.html',
        controller: 'SettingCtrl'
      }
    }
  })
  ;
  // Use Native Scroll

  // if none of the above states are matched, use this as the fallback
  $translateProvider.useSanitizeValueStrategy('escaped');
  
  $urlRouterProvider.otherwise('/tab/message');
  
  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });
  
  $translateProvider.preferredLanguage( localStorage['language'] || 'en');
  $translateProvider.fallbackLanguage("en");

});
