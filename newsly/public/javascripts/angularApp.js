// Defines the app as an angular module. Includes ui-router as a dependency.
var app = angular.module('newsly', ['ui.router']);

//factory for posts
app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  };
  // Retrieves post from backend
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
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
        upvotes: 0,
        comments: [
          {author: 'Joe', body: 'Awesome post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]
      });
      $scope.title = '';
      $scope.link = '';
    };
    // incrementUpvotes function
    $scope.incrementUpvotes = function(post){
      post.upvotes += 1;
    };
  }]);

  app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts){
      // Grabs the appropriate post from the posts factory using the id from $stateParams.
      $scope.post = posts.posts[$stateParams.id];
      $scope.addComment = function(){
        if($scope.body === '') {return; }
        $scope.post.comments.push({
          body: $scope.body,
          author: 'user',
          upvotes: 0
        });
        $scope.body = '';
      };
      $scope.incrementUpvotes = function(comment){
        comment.upvotes += 1;
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
          controller: 'MainCtrl',
          // property of ui-router that ensures posts are loaded
          resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
          }
        })
        // Posts state: individual posts and their comments
        .state('posts', {
          // {id} is a route parameter, made available in the controller
          url: '/posts/{id}',
          templateUrl: '/posts.html',
          controller: 'PostsCtrl'
        });

        // Redirects unspecified routes
        $urlRouterProvider.otherwise('home');
      }]);
