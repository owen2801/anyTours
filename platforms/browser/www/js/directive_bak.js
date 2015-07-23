angular.module('starter.directive', [])

.directive('notificationsReact', function(reactDirective, $translate, $ionicLoading){
		
	//========== React component ==========//
	var notificationsComponent = React.createClass({displayName: "notificationsComponent",
		getDefaultProps: function(){
			return {
				author: $translate.instant("author")
			}
		},
		getInitialState: function() {
        return {
            elements: this.buildElements(0, 200),
            isInfiniteLoading: false
        }
	    },

	    buildElements: function(start, end) {
	    	//var _this = this // http://stackoverflow.com/questions/21010400/how-to-set-event-handler-in-react-sub-component
	    var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );
	    savedNotifications = savedNotifications.reverse();
	        var elements = [];
	        for (var i = start; i < end; i++) {
	            elements.push(React.createElement(notificationComponent, {notification: savedNotifications[i]}))
	        }
	        return elements;
	    },

	    handleInfiniteLoad: function() {
	        var that = this;
	        this.setState({
	            isInfiniteLoading: true
	        });
	        setTimeout(function() {
	            var elemLength = that.state.elements.length,
	                newElements = that.buildElements(elemLength, elemLength + 1000);
	            that.setState({
	                isInfiniteLoading: false,
	                elements: that.state.elements.concat(newElements)
	            });
	        }, 2500);
	    },

	    elementInfiniteLoad: function() {
	        return React.createElement("div", {className: "infinite-list-item"}, 
	            "Loading..."
	        );
	    },
	  render: function() {
	    

	    return React.createElement(Infinite, {elementHeight: 40, 
                         containerHeight: 250, 
                         infiniteLoadBeginBottomOffset: 200, 
                         onInfiniteLoad: this.handleInfiniteLoad, 
                         loadingSpinnerDelegate: this.elementInfiniteLoad(), 
                         isInfiniteLoading: this.state.isInfiniteLoading
                         }, 
            this.state.elements
        );
	      
	  },
	  compoenntWillMount: function () {
	  	$ionicLoading.show({
	      template:"<ion-spinner></ion-spinner>",
	      noBackDrop: true,
	      delay: 500,
	      duration: 10000,
	      hideOnStateChange: true
	    })
	  },
	  compoenntDidMount: function () {
	    $ionicLoading.hide()
	  }
	});

	var notificationComponent = React.createClass({displayName:"notificationComponent",
		getInitialState: function() {
		  return {
		  	status: this.props.notification.status
		  };
		},
		handleClick: function (){
			//console.log("=======" + this.props.notification.key)
			var savedNotifications = JSON.parse( localStorage["messages"] || "[]" );
			savedNotifications = savedNotifications.reverse();
	    	savedNotifications[this.props.notification.key].status = "";
	    	//console.log(JSON.stringify( savedNotifications[this.props.notification.key] ))
	    	savedNotifications = savedNotifications.reverse();
	    	localStorage["messages"] = JSON.stringify( savedNotifications )
	    	this.setState({
	    		status:""
	    	})
		},
		render: function (){
			var text_author = $translate.instant("author");
			var notification = this.props.notification;
			
			return (
				React.createElement("div", {className: "card"},
		          React.createElement("div", {className: "item item-divider " + this.state.status}, 
		            React.createElement("span", {style:{float:"left", fontSize:"0.8em"}}, " ", notification.deliver_date_readable, " "), 
		            React.createElement("span", {style:{float:"right", fontSize:"0.8em"}}, text_author)
		          ), 
		          React.createElement("a", {onClick: this.handleClick, className: "item item-text-wrap", href: "#/tab/message/" + notification.message_id, value:"0" }, 
		            React.createElement("p", {style:{fontSize:"1.2em"}}, " ", notification.alert)
		          )

		        )
			)
		}
	})
	//========== React component ==========//

	return reactDirective(notificationsComponent)
});