// Defines the app as an angular module. Includes ui-router as a dependency.
var app = angular.module('newsly', ['ui.router']);

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
      controller: 'PostsCtrl',
      // property of ui-router that ensures posts AND comments are loaded; anytime the home state is entered, it automatically queries all posts from the backend before the state finished loading
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id)
        }]
      }
    });
    // Redirects unspecified routes
    $urlRouterProvider.otherwise('home');
  }]);

  //factory for posts
  app.factory('posts', ['$http', function($http){
    var o = {
      posts: []
    };
    // Retrieves post from backend
    o.getAll = function() {
      // queries the '/posts' route
      return $http.get('/posts').success(function(data){
        // Creates a deep copy of the returned data (ensures $scope.posts in MainCtrl is updated)
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
      // instead of using success(), using a promise
      return $http.get('/posts/' + id).then(function(res){
        return res.data;
      });
    };
    // method for adding comments to posts
    o.addComment = function(id, comment) {
      return $http.post('/posts/' + id + '/comments', comment);
    };
    // method for upvoting comments
    o.upvoteComment = function(post, comment) {
      return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data){
        comment.upvotes += 1;
      });
    };
    return o;
  }]);

  app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    return auth;

    auth.saveToken = function (token){
      $window.localStorage['newsly-token'] = token;
    };
    auth.getToken = function (){
      return $window.localStorage['newsly-token'];
    }
    auth.isLoggedIn = function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };
    auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    };
    auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
    auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
    auth.logOut = function(){
      $window.localStorage.removeItem('newsly-token');
    };
  }])

  // Main conterller referenced in the <body> tag.
  app.controller('MainCtrl', [
    '$scope',
    // injects 'posts' service in the Main controller
    'posts',
    function($scope, posts){
      // Binds the posts array in the factory to the $scope.posts variable
      $scope.posts = posts.posts;
      // Setting title to blank to prevent empty posts
      $scope.title = '';
      // addPost function
      $scope.addPost = function(){
        // Stops a user from submitting a blank title
        if(!$scope.title || $scope.title === '') { return; }
        // saves posts to the server, persistent data
        posts.create({
          title: $scope.title,
          link: $scope.link,
        });
        // clears the values
        $scope.title = '';
        $scope.link = '';
      };
      // incrementUpvotes function
      $scope.incrementUpvotes = function(post){
        posts.upvote(post);
      };
    }]);

    app.controller('PostsCtrl', [
      '$scope',
      'posts',
      'post',
      function($scope, posts, post){
        // Grabs the appropriate post from the posts factory using the id from $stateParams.
        $scope.post = post;

        $scope.addComment = function(){
          if($scope.body === '') { return; }
          posts.addComment(post._id, {
            body: $scope.body,
            author: 'user',
          }).success(function(comment) {
            $scope.post.comments.push(comment);
          });
          $scope.body = '';
        };
        // enabels upvoting comments
        $scope.incrementUpvotes = function(comment){
          posts.upvoteComment(post, comment);
        };
      }]);

      app.controller('AuthCtrl', [
        '$scope',
        '$state',
        'auth',
        function($scope, $state, auth){
          $scope.user = {};

          $scope.register = function(){
            auth.register($scope.user).error(function(error){
              $scope.error = error;
            }).then(function(){
              $state.go('home');
            });
          };

          $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
              $scope.error = error;
            })
          }
        }])
