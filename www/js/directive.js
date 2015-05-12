angular.module('starter.directive', [])

.directive('notificationsReact', function(reactDirective){
	return reactDirective(notificationsComponent)
});