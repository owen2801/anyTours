

window.notificationsComponent = React.createClass({displayName: "notificationsComponent",
  render: function() {
  	var scope = this.props.scope;
  	var notifications = scope.notifications;

  	var notification = _.map(notifications, function (notification) {
  		return (
  			React.createElement("div", {className: "card"}, 
		      React.createElement("div", {className: "item item-divider"}, 
		        React.createElement("span", null, " ", notification.deliver_date_readable, " "), 
		        React.createElement("span", {translate: "author"}, "By Any Tours")
		      ), 
		      React.createElement("div", {className: "item item-text-wrap", href: "#/tab/message/{notification.message_id}"}, 
		        React.createElement("p", {style: "font-size: 1.2em"}, notification.alert)
		      )
		    )
  			);
  	})
  },
  compoenntDidMount: function () {
  	console.log("======= Component Mounted !")
  }
});
//app.value('notificationComponent', notificationComponent);