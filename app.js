// Defines the app as an angular module.
var app = angular.module('Newsly', []);

// Main conterller referenced in the <body> tag.
app.controller('MainCtrl', [
  '$scope',
  function($scope){
    $scope.test = "Hello World!";

    $scope.posts = [
      {title: 'post 1', upvotes: 5},
      {title: 'post 2', upvotes: 2},
      {title: 'post 3', upvotes: 15},
      {title: 'post 4', upvotes: 9},
      {title: 'post 5', upvotes: 4}
    ];
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
