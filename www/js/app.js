// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('cesium', ['ionic', 'ngCordova', 'ionic-material', 'ngMessages', 'pascalprecht.translate', 'angularMoment', 'cesium.controllers', 'ngAnimate', 'ionic-native-transitions'])

  .filter('formatInteger', function() {
    return function(input) {
      return input ? numeral(input).format('0,0').replace(',', ' ') : '0';
    };
  })

  .filter('formatDecimal', function() {
      return function(input) {
        if (!input) return '0';
        if (Math.abs(input) < 0.0001) return '~ 0';
        return numeral(input).format('0,0.0000').replace(',', ' ');
      };
    })

  .filter('formatDate', function() {
    return function(input) {
      // TODO: use local format
      return input ? moment(parseInt(input)*1000).local().format('YYYY-MM-DD HH:mm') : '';
    };
  })

  .filter('formatFromNow', function() {
    return function(input) {
      return input ? moment(parseInt(input)*1000).startOf('minute').fromNow() : '';
    };
  })

  .filter('formatDuration', function() {
    return function(input) {
      return input ? moment(moment().utc().valueOf() + parseInt(input)*1000).startOf('minute').fromNow() : '';
    };
  })

  .filter('abbreviate', function() {
    return function(input) {
      var unit = '', sepChars = ['-', '_', ' '], currency = input || '';
      for (var i = 0; i < currency.length; i++) {
        var c = currency[i];
        if (i === 0 || (i > 0 && sepChars.indexOf(currency[i-1]) != -1)) {
          unit += c;
        }
      }
      return unit.toUpperCase();
    };
  })

  .filter('formatPubkey', function() {
    return function(input) {
      return input ? input.substr(0,8) : '';
    };
  })

  .filter('formatCategory', function() {
    return function(input) {
      return input && input.length > 28 ? input.substr(0,25)+'...' : input;
    };
  })

  // Convert to user friendly URL (e.g. "Like - This" -> "like-this")
  .filter('formatSlug', function() {
    return function(input) {
      return input ? encodeURIComponent(input
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-'))
        : '';
    };
  })

  // Translation i18n
  .config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'i18n/locale-',
        suffix: '.json'
    })
    .uniformLanguageTag('bcp47')
    .determinePreferredLanguage()
    // Cela fait bugger les placeholder (pb d'affichage des accents en FR)
    //.useSanitizeValueStrategy('sanitize')
    .useSanitizeValueStrategy(null)
    .fallbackLanguage(['en'])
    .useLoaderCache(true)
    .useStorage('localStorage');
  })

  .config(['$httpProvider', 'APP_CONFIG', function($httpProvider, APP_CONFIG) {
    $httpProvider.defaults.timeout = !!APP_CONFIG.TIMEOUT ? APP_CONFIG.TIMEOUT : 4000 /* default timeout */;
  }])

  .config(['$compileProvider', 'APP_CONFIG', function($compileProvider, APP_CONFIG) {
      $compileProvider.debugInfoEnabled(!!APP_CONFIG.DEBUG);
  }])

  .config(function($animateProvider) {
      $animateProvider.classNameFilter( /\banimate-/ );
  })

  .config(['$ionicNativeTransitionsProvider', 'APP_CONFIG', function($ionicNativeTransitionsProvider, APP_CONFIG){
    if (!!APP_CONFIG.NATIVE_TRANSITION) {
      $ionicNativeTransitionsProvider.enable(true);
      $ionicNativeTransitionsProvider.setDefaultOptions({
          duration: 400, // in milliseconds (ms), default 400,
          slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
          iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
          androiddelay: -1, // same as above but for Android, default -1
          winphonedelay: -1, // same as above but for Windows Phone, default -1,
          fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
          fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
          triggerTransitionEvent: '$ionicView.afterEnter', // internal ionic-native-transitions option
          backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
      });
      $ionicNativeTransitionsProvider.setDefaultTransition({
        type: 'slide',
        direction: 'left'
      });
      $ionicNativeTransitionsProvider.setDefaultBackTransition({
          type: 'slide',
          direction: 'right'
      });
    }
    else {
      $ionicNativeTransitionsProvider.enable(false);
    }
  }])

  .config(function($ionicConfigProvider) {
      if (ionic.Platform.isAndroid()) {
        $ionicConfigProvider.scrolling.jsScrolling(false);
      }
      $ionicConfigProvider.views.maxCache(5);
  })

  // Add new compare-to directive (need for form validation)
  .directive("compareTo", function() {
      return {
          require: "ngModel",
          scope: {
              otherModelValue: "=compareTo"
          },
          link: function(scope, element, attributes, ngModel) {

              ngModel.$validators.compareTo = function(modelValue) {
                  return modelValue == scope.otherModelValue;
              };

              scope.$watch("otherModelValue", function() {
                  ngModel.$validate();
              });
          }
      };
  })

  // Add a copy-on-click directive
  .directive('copyOnClick', ['$window', 'Device', function ($window, Device) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
              element.bind('click', function () {
                if (!Device.clipboard.enable) {
                  if ($window.getSelection && !$window.getSelection().toString() && this.value) {
                    this.setSelectionRange(0, this.value.length);
                  }
                }
              });
              element.bind('hold', function () {
                if (Device.clipboard.enable && this.value) {
                  Device.clipboard.copy(this.value);
                }
              });
          }
      };
  }])

  // Add a select-on-click directive
  .directive('selectOnClick', ['$window', function ($window) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
              element.bind('click', function () {
                if ($window.getSelection && !$window.getSelection().toString() && this.value) {
                  this.setSelectionRange(0, this.value.length);
                }
              });
          }
      };
  }])

.run(function($rootScope, amMoment, $translate, Device) {

  // We use 'Device.ready()' instead of '$ionicPlatform.ready()', because it could be call many times
  Device.ready()
  .then(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.onLanguageChange = function() {
    var lang = $translate.use();
    moment.locale(lang.substring(0,2));
  };

  // Set up moment translation
  $rootScope.$on('$translateChangeSuccess', $rootScope.onLanguageChange);

})
;
