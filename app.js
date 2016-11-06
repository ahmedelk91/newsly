// Defines the app as an angular module. Includes ui-router as a dependency.
var app = angular.module('newsly', ['ui.router']);

//factory for posts
app.factory('posts', [function(){
  var o = {
    posts: []
  };
  return o;
}]);
// Main conterller referenced in the <body> tag.
app.controller('MainCtrl', [
  '$scope',
  // injects 'posts' service in the Main controller
  'posts',
  function($scope, posts){
    // Binds the posts array in the factory to the $scope.posts variable
    $scope.posts = posts.posts;
    // addPost function
    $scope.addPost = function(){
      // Stops a user from submitting a blank title
      if(!$scope.title || $scope.title === '') { return; }
      // Pushes the new post to the $scope.post array
      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0
      });
      $scope.title = '';
      $scope.link = '';
    };
    // incrementUpvotes function
    $scope.incrementUpvotes = function(post){
      post.upvotes += 1;
    };
  }]);

  // Configures home state using $stateProvider
  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

      $stateProvider
      .state('home', {
        url:'/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl'
      });
      // Redirects unspecified routes
      $urlRouterProvider.otherwise('home');
    }]);
