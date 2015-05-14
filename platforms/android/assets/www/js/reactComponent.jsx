/** @jsx React.DOM */
var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );

window.notificationsComponent = React.createClass({
  handleClick : function (){
    savedNotifications[key].status = "";
  },
  render: function() {
  	var cards = savedNotifications.map(function(notification, key){
  		return (
        <notificationComponent notification={notification}></notificationComponent>
  			);
  	})

    return <div>{cards}</div>
  },
  compoenntDidMount: function () {
  	console.log("======= Component Mounted !")
  }
});
//app.value('notificationComponent', notificationComponent);