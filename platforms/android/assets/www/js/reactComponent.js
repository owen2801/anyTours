window.notificationsComponent = React.createClass({displayName: "notificationsComponent",
  render: function() {
    var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );
    var cards = savedNotifications.map(function(notification){
      return (
        React.createElement("div", {className: "card"}, 
          React.createElement("div", {className: "item item-divider"}, 
            React.createElement("span", {style:{float:"left", fontSize:"0.8em"}}, " ", notification.deliver_date_readable, " "), 
            React.createElement("span", {translate: "author", style:{float:"right", fontSize:"0.8em"}}, "By Any Tours")
          ), 
          React.createElement("a", {className: "item item-text-wrap", href: "#/tab/message/" + notification.message_id}, 
            React.createElement("p", {style:{fontSize:"1.2em"}}, " ", notification.alert)
          )
        )
        );
    })

    return  React.createElement("div", null, cards);
      
  },
  compoenntDidMount: function () {
    console.log("======= Component Mounted !")
  }
});
//app.value('notificationComponent', notificationComponent);