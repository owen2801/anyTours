angular.module('starter.services', [])

.factory('Messages', ['$http', function ($http) {
    // Might use a resource here that returns a JSON array
  var messages = [{
    id: 0,
    topic: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    topic: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    topic: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    topic: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    topic: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

/*
    var req = {
      method: 'GET',
      url: 'results.json',
      headers: {
        'dataType': 'json'
      }
    }

    var messages = [];

      $http(req)
      .success(function (data, status, headers, config) {

        angular.forEach(data, function (value, key) {
          messages.unshift({ 
            id: value.id , 
            topic: value.topic,
            face: 'http://www.hubbis.com/hp/profiles/photo/' + value.image,
            description: value.description
          });

        });

      })
      .error(function (data, status, headers, config) {
        console.log("Unable to get list")
      });

  // Some fake testing data
  var messages = [{
    id: 0,
    topic: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    topic: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    topic: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    topic: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    topic: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];
  */
  return {
    all: function() {
      return messages;
    },
    remove: function(message) {
      messages.splice(messages.indexOf(message), 1);

    },
    get: function(messageId) {
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].id === parseInt(messageId)) {
          return messages[i];
        }
      }
      return null;
    }
  };
}]
)
.factory(("ionPlatform"), function( $q ){
    var ready = $q.defer();

    ionic.Platform.ready(function( device ){
        ready.resolve( device );
    });

    return {
        ready: ready.promise
    }
})
