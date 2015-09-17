$(function(){
  /*
  $('.fc-ios').devicify({
    images: ['js/vendor/frame-carousel/images/c2x_ios/intro_screen_1.png',
    'js/vendor/frame-carousel/images/c2x_ios/intro_screen_2.png',
    'js/vendor/frame-carousel/images/c2x_ios/intro_screen_3.png'],
    frame: 'js/vendor/frame-carousel/frames/frame_iphone6.png',
    boundingBox: {
      left: '6.25%',
      top: '11.5%',
      width: '87.2%',
      height: '76.74%'
    }
  });

  $('.fc-android').devicify({
    images: ['js/vendor/frame-carousel/images/c2x_ios/intro_screen_1.png',
    'js/vendor/frame-carousel/images/c2x_ios/intro_screen_2.png',
    'js/vendor/frame-carousel/images/c2x_ios/intro_screen_3.png'],
    frame: 'js/vendor/frame-carousel/frames/frame.png',
    boundingBox: {
      left: '11.6%',
      top: '8.13%',
      width: '76.5%',
      height: '80%'
    },
    frameSize: {width: 400, height: 680}
  });

  $('.fc-mbp').devicify({
    images: ['js/vendor/frame-carousel/images/osx/1.png',
    'js/vendor/frame-carousel/images/osx/2.png',
    'js/vendor/frame-carousel/images/osx/3.png',
    'js/vendor/frame-carousel/images/osx/4.png',
    'js/vendor/frame-carousel/images/osx/5.png',],
    frame: 'js/vendor/frame-carousel/frames/frame_mbp.png',
    frameSize: {width: 800, height: 479},
    boundingBox: {
      left: '12.6%',
      top: '8.2%',
      width: '74%',
      height: '76%'
    }
  });
  */

  // Fixes: hides menu in collapsed mode when a nav item is clicked
  // Fix copied from here: https://github.com/twbs/bootstrap/issues/9013
  $('ul.navbar-nav.nav li a').click(function() {
    var navbar_toggle = $('.navbar-toggle');
    if (navbar_toggle.is(':visible')) {
        navbar_toggle.trigger('click');
    }
  });

  $('.fc-mac').frameCarousel();
});
