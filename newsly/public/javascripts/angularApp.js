// Defines the app as an angular module. Includes ui-router as a dependency.
var app = angular.module('newsly', ['ui.router']);

//factory for posts
app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  };
  // Retrieves post from backend
  o.getAll = function() {
    // queries the '/posts' route
    return $http.get('/posts').success(function(data){
      // Creates a deep copy of the returned data (ensures $scope.posts in MainCtrl is updated
      angular.copy(data, o.posts);
    });
  };
  // method for creating new posts
  o.create = function(post) {
    // binds function that will be executed when the request returns
    return $http.post('/posts', post).success(function(data){
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote').success(function(data){
      post.upvotes += 1;
    });
  };
  // returns a single post from the server
  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
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
      // saves posts to the server, persistent data
      posts.create({
        title: $scope.title,
        link: $scope.link,
      });
      $scope.title = '';
      $scope.link = '';
    };
    // incrementUpvotes function
    $scope.incrementUpvotes = function(post){
      posts.upvote(post);
    }
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
          // property of ui-router that ensures posts are loaded; anytime the home state is entered, it automatically queries all posts from the backend before the state finished loading
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
