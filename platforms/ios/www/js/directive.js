angular.module('starter.directive', [])

.directive('notificationReact', function(reactDirective){
	return reactDirective(notificationComponent)
});