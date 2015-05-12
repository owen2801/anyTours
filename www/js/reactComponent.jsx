/** @jsx React.DOM */
window.notificationsComponent = React.createClass({
  render: function() {
  	var scope = this.props.scope;
  	var notifications = scope.notifications;

  	var notification = _.map(notifications, function (notification) {
  		return (
  			<div className="card">
		      <div className="item item-divider">
		        <span> {notification.deliver_date_readable} </span>
		        <span translate="author">By Any Tours</span>
		      </div>
		      <div className="item item-text-wrap" href="#/tab/message/{notification.message_id}">
		        <p style="font-size: 1.2em">{notification.alert}</p>
		      </div>
		    </div>
  			);
  	})
  },
  compoenntDidMount: function () {
  	console.log("======= Component Mounted !")
  }
});
//app.value('notificationComponent', notificationComponent);