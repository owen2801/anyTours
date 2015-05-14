
window.notificationsComponent = React.createClass({displayName: "notificationsComponent",
  handleClick : function (key){
    var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );
    savedNotifications[key].status = "";
  },
  render: function() {
    //var _this = this // http://stackoverflow.com/questions/21010400/how-to-set-event-handler-in-react-sub-component
    var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );
    savedNotifications = savedNotifications.reverse();
    
    var cards = savedNotifications.map(function(notification, key){
      return (
        React.createElement("div", {className: "card"}, 
          React.createElement("div", {className: "item item-divider " + notification.status}, 
            React.createElement("span", {style:{float:"left", fontSize:"0.8em"}}, " ", notification.deliver_date_readable, " "), 
            React.createElement("span", {translate: "author", style:{float:"right", fontSize:"0.8em"}}, "By Any Tours")
          ), 
          React.createElement("a", {onClick: this.handleClick.bind(this, key), className: "item item-text-wrap", href: "#/tab/message/" + notification.message_id }, 
            React.createElement("p", {style:{fontSize:"1.2em"}}, " ", notification.alert)
          )
        )
        );
    }, this ) // very important

    return  React.createElement("div", null, cards);
      
  },
  compoenntDidMount: function () {
    console.log("======= Component Mounted !")
  }
});
//app.value('notificationComponent', notificationComponent);