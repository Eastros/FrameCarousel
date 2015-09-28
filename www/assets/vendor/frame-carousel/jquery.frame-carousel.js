/*! Frame Carousel - v0.1.0 - 2015-09-28
* http://www.eastros.com/frame-carousel/
* Copyright (c) 2015 Umar Ashfaq; Licensed MIT */
/*! Frame Carousel - v0.1.0 - 2015-06-09
* http://www.eastros.com/frame-carousel/
* Copyright (c) 2015 Umar Ashfaq; Licensed MIT */

(function($) {

  var
    template =
      '<div class=\'fc-controls\'>'+
      '<a href=\'#\' rel=\'go-left\' class=\'fc-btn fc-btn-left\'></a>'+
      '<a href=\'#\' rel=\'go-right\' class=\'fc-btn fc-btn-right\'></a>'+
      '</div>'+
      '<div class=\'fc-pagination\'>'+
      '<div class=\'fc-pagination-inner\'>'+
      '</div>'+
      '</div>'+
      '<div class=\'fc-image-mask\'>'+
      '<div class=\'fc-film\'></div>'+
      '</div>',

    events = {
      touchstart: 'touchstart mousedown',
      touchmove: 'touchmove mousemove',
      touchend: 'touchend mouseup',
      touchcancel: 'touchcancel',
      touchleave: 'touchleave mouseout',
      transitionend: 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd'
    },

    /*
    getPercentage = function($el, property) {
      var v = $el[0].style[property],
        iop = v.indexOf('%');

      if ( iop ) {
        v = v.substring(0, iop);
      }

      return parseFloat(v);
    },
    */

    /**
     * A utility function that gives access to a CSS 'background-image'.
     * Used internally.
     */
    getImage = function( path ) {
      var tempImg = $('<img />'),
        d = $.Deferred();

      tempImg.hide(); //hide image
      tempImg.bind('load', function(){
        d.resolve($(this));
      });
      $('body').append(tempImg); // add to DOM before </body>
      tempImg.attr('src', path);
      $('#tempImg').remove(); //remove from DOM

      return d;
    },

    getPosition = function( e ) {
      var event = e.originalEvent || e,
        r;

      if ( event.touches && event.touches.length ) {
        r = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY
        };
      } else if ( event.changedTouches && event.changedTouches.length ) {
        r = {
          x: event.changedTouches[0].pageX,
          y: event.changedTouches[0].pageY
        };
      } else if ( event.pageX !== undefined ) {
        r = {
          x: event.pageX,
          y: event.pageY
        };
      } else {
        r = {
          x: event.clientX,
          y: event.clientY
        };
      }

      return r;
    },

    getValidFrameSize = function() {
      // current screen width
      var csw = $(window).width(),
        isValid = function( fs ) {
          var r = false;

          if ( fs.minScreenWidth && fs.maxScreenWidth ) {
            r = csw >= fs.minScreenWidth && csw <= fs.maxScreenWidth;
          } else if ( fs.maxScreenWidth ) {
            r = csw <= fs.maxScreenWidth;
          } else if ( fs.minScreenWidth ) {
            r = csw >= fs.minScreenWidth;
          } else {
            r = true;
          }

          return r;
        },
        r;

      this.options.frameSize.every(function( fs ){
        if ( isValid(fs) ) {
          r = fs;
          return false;
        }

        return true;
      }, this);

      return r;
    },

    setupDefaults = function() {
      var dirSample = $('script[src*="frame-carousel"]')
        .attr('src')  // the js file path
        .replace('jquery.frame-carousel.js', '')
        .replace('jquery.frame-carousel.min.js', '')+
        'sample/';

      // console.log('dirSample: '+dirSample);

      this.options = $.extend({
        first: 0,
        debug: false,
        swipeThreshold: 10,
        frame: dirSample + 'frame.png',
        frameSize: [{width: 600, minScreenWidth: 1200},
          {width: 500, maxScreenWidth: 1199, minScreenWidth: 768},
          {width: 300, maxScreenWidth: 767}],
        boundingBox: {
          left: '4.3%',
          top: '4.48%',
          width: '91.4%',
          height: '61.1%'
        },
        collapseThreshold: 450,
        images: (function(){ return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(n){ return dirSample + n + '.jpg'; }); })(),
        controlsPosition: {
          top: '35%'
        },
        autoplay: false,
        autoplayInterval: 2000
      }, this.options);

      return getImage( this.options.frame )
        .then($.proxy(function( $img ){

          // update frameSize array

          // original frame size
          var ofs = {
              width: $img.width(),
              height: $img.height()
            },

            // original frame aspect ratio
            ofar = ofs.width / ofs.height;

          this.options.frameSize =
            this.options.frameSize.map(function( fs ){
              // set 1
              // case: height / width
              // case: height / no width
              // case: width / no height
              // case: no width / no height
              if ( fs.width && fs.height ) {

              } else if ( !fs.width && fs.height ) {
                fs.width = fs.height * ofar;
              } else if ( fs.width && !fs.height ) {
                fs.height = fs.width / ofar;
              } else if ( !fs.width && !fs.height ) {
                fs.width = ofs.width;
                fs.height = ofs.height;
              }

              return fs;
            });

          this.options.frameSize.push(ofs);

          this.attributes = $.extend(this.attributes, {
            originalFrameSize: ofs,
            current: 0,
            id: (new Date()).getTime(),
            originalStyleValue: this.$el.attr('style') || '',
            originalClassValue: this.$el.attr('class') || ''
          });
        }, this));
    },

    onClickGoLeft = function() {
      this.previous();
      return false;
    },

    onClickGoRight = function() {
      this.next();
      return false;
    },

    onSwipeBegin = function(event) {
      var p = getPosition(event),
        sw = this.elements.$mask.width(),
        sc = this.elements.$images.length,
        sp = 100 / sc,
        so = sp * this.attributes.current;

      $.extend(this.attributes, {
        swipeStartPosition: p,
        screenWidth: sw,
        screenCount: sc,
        screenWidthAsPercentageOfFilm: sp,
        screenOffset: so,
        thresholdAsPercentageOfFilm: this.options.swipeThreshold / 100 * sp,
        hasTouchStarted: true
      });

      return false;
    },

    onSwipeMove = function(event) {
      if ( !this.attributes.hasTouchStarted ) {
        return false;
      }

      var p = getPosition(event);

      this.attributes.swipeDisplacement = {
          x: (this.attributes.swipeStartPosition.x - p.x) / this.attributes.screenWidth * this.attributes.screenWidthAsPercentageOfFilm,
          y: this.attributes.swipeStartPosition.y - p.y
        };

      this.attributes.swipeCompoundDisplacement = {
          x: this.attributes.swipeDisplacement.x + this.attributes.screenOffset,
          y: this.attributes.swipeDisplacement.y
        };

      if ( this.attributes.swipeCompoundDisplacement.x < 0 ) {
        this.attributes.swipeCompoundDisplacement.x = 0;
      }

      if ( this.attributes.swipeCompoundDisplacement.x + this.attributes.screenWidthAsPercentageOfFilm > 100 ) {
        this.attributes.swipeCompoundDisplacement.x = this.attributes.screenWidthAsPercentageOfFilm * (this.attributes.screenCount - 1);
      }

      this.goto(this.attributes.current, {
        animate: false,
        updateStates: false,
        distance: this.attributes.swipeCompoundDisplacement.x
      });

      return false;
    },

    onSwipeEnd = function() {
      if ( !this.attributes.hasTouchStarted ) {
        return false;
      }

      delete this.attributes.hasTouchStarted;

      var screensToMove = Math.abs ( Math.ceil( this.attributes.swipeDisplacement.x / this.attributes.screenWidthAsPercentageOfFilm ) );

      // if distance is past certain threshold, go to next screen
      // otherwise return to this screen

      if ( Math.abs(this.attributes.swipeDisplacement.x) > this.attributes.thresholdAsPercentageOfFilm ) {
        if ( this.attributes.swipeDisplacement.x < 0 ) {
          this.goto(this.attributes.current - screensToMove -1);
        } else {
          this.goto(this.attributes.current + screensToMove);
        }
      } else {
        this.goto(this.attributes.current);
      }

      return false;
    },

    onSwipeCancel = function() {
      delete this.attributes.hasTouchStarted;

      // return to this screen
      this.goto(this.attributes.current);
    },

    onAnimationComplete = function() {
      // alert('Animation complete')
      this.attributes.is_animating = false;
      this.elements.$film.css('transition', 'all 0s');
    },

    onWindowResizeWrapper = function() {
      clearTimeout(this.attributes.resizeTimeout);
      this.attributes.resizeTimeout = setTimeout($.proxy(onWindowResize, this), 500);
    },

    onWindowResize = function() {
      // console.log('Resize detected ...');
      this.$el.css( getValidFrameSize.call(this) )
        [ $(window).width() > this.options.collapseThreshold ? 'removeClass' : 'addClass']('fc-collapsed');
    },

    updateButtonStates = function() {
      this.elements.$btn_go_left.fcRemoveClass('disabled');
      this.elements.$btn_go_right.fcRemoveClass('disabled');

      if ( this.attributes.current === 0 ) {
        this.elements.$btn_go_left.fcAddClass('disabled');
      } else if ( this.attributes.current === this.elements.$images.length - 1 ) {
        this.elements.$btn_go_right.fcAddClass('disabled');
      }
    },
    
    onAutoplayStep = function() {
      this.goto( (this.attributes.current + 1) % this.count() );
    },
    
    setupHTML = function() {
      $(window).resize( $.proxy(onWindowResizeWrapper, this));

      this.$el
        .fcAddClass('fc')
        .fcAddClass('fc-'+this.attributes.id)
        .css({
          'background-image': 'url(\''+this.options.frame+'\')'
        })
        .append( template );

      if ( this.options.debug ) {
        this.$el.fcAddClass('fc-debug');
      }

      this.$el
        .css( getValidFrameSize.call(this) )
        [ $(window).width() > this.options.collapseThreshold ? 'removeClass' : 'addClass']('fc-collapsed');
      
      
      this.elements = $.extend(this.elements, {
        $controls: this.$('.fc-controls'),
        $pgn_inner: this.$('.fc-pagination-inner'),
        $mask: this.$('.fc-image-mask'),
        $film: this.$('.fc-film'),
        $btn_go_left: this.$('a[rel=go-left]'),
        $btn_go_right: this.$el.find('a[rel=go-right]')
      });

      if ( this.options.controlsPosition ) {
        this.elements.$controls.css( this.options.controlsPosition );
      }

      // add mask element
      this.elements.$mask
            .css( this.options.boundingBox );
          //  .on(events.mousedown, $.proxy(onSwipeBegin, this));

            /*
            .swipe({
              swipeStatus:$.proxy(function(event, phase) {
                if(phase===$.fn.swipe.phases.PHASE_START) {
                  onSwipeBegin.call(this, event);
                }
                /*
                else if(phase===$.fn.swipe.phases.PHASE_MOVE) {
                  onSwipeMove.call(this, event);
                }
                else if ( phase===$.fn.swipe.phases.PHASE_END ) {
                  onSwipeEnd.call(this, event);
                }
                else if ( phase===$.fn.swipe.phases.PHASE_CANCEL ) {
                  onSwipeCancel.call(this, event);
                }
                *//*
              }, this),
              threshold:0,
              fingers:'all'
            });
            */

      var eventTarget = this.attributes.touchEventTarget = '.fc-' + this.attributes.id + ' .fc-image-mask';

      $('body')
        .on(events.touchstart, eventTarget, $.proxy(onSwipeBegin, this))
        .on(events.touchmove, eventTarget, $.proxy(onSwipeMove, this))
        .on(events.touchend, eventTarget, $.proxy(onSwipeEnd, this))
        .on(events.touchcancel, eventTarget, $.proxy(onSwipeCancel, this))
        .on(events.touchleave, eventTarget, $.proxy(onSwipeEnd, this));

      this.elements.$film
            .css({
              width: this.options.images.length * 100 + '%'
            })
            .on(events.transitionend, $.proxy(onAnimationComplete, this));

      // add screenshots
      $.each(this.options.images, $.proxy(function( index, image ){
        var $bullet = $('<a/>')
            .attr({
              href: '#'
            })
            .html('&nbsp;')
            .click($.proxy(function(){
              this.goto(index);
              return false;
            }, this))
            .appendTo( this.elements.$pgn_inner );

        $('<div/>')
          .fcAddClass('fc-image-masked')
          .fcAddClass('fc-animate')
          .css($.extend({
            'background-image': 'url(\''+image+'\')'
          }, this.options.boundingBox, {
      //      'margin-left': (index * 100) + '%',
            width: 100 / this.options.images.length + '%',
            height: '100%',
            left: ( index * 100 ) + '%'
          }))
          .appendTo( this.elements.$film )
          .on('change:class', $.proxy(function(e){
            if ( e.className === 'active' ) {
              $bullet[e.changeType]('active');
            }
          }, this));

      }, this));

      this.elements.$images = this.$('.fc-image-masked');
      this.elements.$btn_go_left.click($.proxy(onClickGoLeft, this));
      this.elements.$btn_go_right.click($.proxy(onClickGoRight, this));
    };

  function FrameCarousel(el, options) {
    $.extend(this, {
      el: el,
      $el: $(el).data('frameCarousel', this),
      $: $.proxy($.fn.find, $(el)),
      options: options || {},
      attributes: {},
      elements: {}
    });

    setupDefaults.call(this)
      .then($.proxy(function(){
        setupHTML.call(this);

        this.goto( this.options.first, {
          animate: false
        });
        
        if ( this.options.autoplay ) {
          this.play();
        }
      }, this));
  }

  $.extend(FrameCarousel.prototype, {
    debug: function(msg) {
      if ( this.options.debug ) {
        this.$el.attr('data-debug', msg);
      }
    },

    count: function() {
      var $imgs = this.$el.find('.fc-image-masked');
      return $imgs.length;
    },

    goto: function( n, options ) {
      options = options || {};
      options = $.extend({
        animate: true,
        updateStates: true,

        // distance is in percentage relative to $film size
        distance: n * (100 / this.elements.$images.length)
      }, options);

      if ( this.attributes.is_animating || n < 0 || n > this.elements.$images.length - 1) {
        return;
      }

      if ( options.animate ) {
        this.attributes.is_animating = true;
      }

      var // distance = (n - this._current ) * this.$images.eq(0).width(),
        distance = options.distance,
        x = (0-distance) + '%',
        cssMap = {
          transform: 'translate3d('+x+', 0, 0)'
        };

      // this.$el.attr('data-debug', 'translate3d('+x+', 0, 0)');
      // console.log('[goto] $film.x: '+x);

      if ( options.animate ) {
        cssMap['transition'] = 'all .4s ease-out';
      }

      this.elements.$film.css(cssMap);


      if ( options.animate ) {
        setTimeout($.proxy(function(){
          if ( this.attributes.is_animating ) {
            this.attributes.is_animating = false;
          }
        }, this), 1000);
      }

      if ( options.updateStates ) {
        this.attributes.current = n;
        this.elements.$images.fcRemoveClass('active');
        this.elements.$images.eq(n).fcAddClass('active');

        updateButtonStates.call(this);
      }

      // this.$el.attr('data-debug', this.$film.css('transition'));
      // console.log('[goto] current_screen: '+this._current);
    },
    next: function( options ) {
      this.goto( this.attributes.current + 1, options );
    },
    previous: function( options ) {
      this.goto( this.attributes.current - 1, options );
    },
    resize: function() {

    },
    removeFrame: function() {

    },
    play: function() {
      this.attributes.timeoutID = setInterval($.proxy(onAutoplayStep, this), this.options.autoplayInterval);
    },
    stop: function() {
      if ( this.attributes.timeoutID ) {
        clearTimeout( this.attributes.timeoutID );
        delete this.attributes.timeoutID;
      }
    },
    destroy: function() {
      var eventTarget = this.attributes.touchEventTarget;

      $('body')
        .off(events.touchstart, eventTarget, onSwipeBegin)
        .off(events.touchmove, eventTarget, onSwipeMove)
        .off(events.touchend, eventTarget, onSwipeEnd)
        .off(events.touchcancel, eventTarget, onSwipeCancel)
        .off(events.touchleave, eventTarget, onSwipeEnd);

      $(window).off('resize', onWindowResizeWrapper);

      this.$el
        .empty()
        .attr({
          'class': this.attributes.originalClassValue,
          'style': this.attributes.originalStyleValue
        });
    }
  });

  $.extend($.fn, {
    frameCarousel: function( options ) {
      return this.each(function(){
        return new FrameCarousel( this, options );
      });
    },

    /**
     * An extension of $.fn.addClass that also throws an event when invoked.
     * Used internally.
     */
    fcAddClass:  function( className ) {
      var r = $.fn.addClass.apply(this, arguments);

      $(this).trigger($.Event('change:class', {
        target: this,
        changeType: 'addClass',
        className: className
      }));

      return r;
    },

    /**
     * An extension of $.fn.removeClass that also throws an event when invoked.
     * Used internally.
     */
    fcRemoveClass: function( className ) {
      var r = $.fn.removeClass.apply(this, arguments);

      $(this).trigger($.Event('change:class', {
        target: this,
        changeType: 'removeClass',
        className: className
      }));

      return r;
    }
  });

}(jQuery));
